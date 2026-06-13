// E2E concurrencia: carreras de estado bajo requests en paralelo.
//   node scripts/e2e_concurrency.mjs
import 'dotenv/config'
import pg from 'pg'
import { SignJWT } from 'jose'

const BASE = process.env.E2E_BASE || 'http://localhost:3001'
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
const secret = new TextEncoder().encode(process.env.JWT_SECRET)
const ADMIN = { sub: '1', email: 'admin@epicrisis.cl', role: 'admin' }
const A = { sub: '2', email: 'estudiante1@epicrisis.cl', role: 'annotator' }
const B = { sub: '3', email: 'estudiante2@epicrisis.cl', role: 'annotator' }
const tok = (u) => new SignJWT({ ...u }).setProtectedHeader({ alg: 'HS256' }).setIssuedAt().setExpirationTime('7d').sign(secret)

let pass = 0, fail = 0
const check = (n, cond, extra = '') => { if (cond) { pass++; console.log(`  ✓ ${n}`) } else { fail++; console.log(`  ✗ ${n} ${extra}`) } }

async function api(path, method, u, body) {
  const res = await fetch(BASE + path, { method, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${await tok(u)}` }, body: body ? JSON.stringify(body) : undefined })
  let json = null; try { json = await res.json() } catch {}
  return { status: res.status, json }
}
const crit = (names, val) => names.map(n => ({ criterionName: n, isPresent: val, evidenceText: null, comments: null }))
async function dbStatus(c, id) { return (await c.query('SELECT status FROM epicrisis WHERE id=$1', [id])).rows[0]?.status }
async function mk(c, assignees) {
  const id = (await c.query("INSERT INTO epicrisis (patient_id,status) VALUES ('E2E-CONC','pending') RETURNING id")).rows[0].id
  for (const uid of assignees) await c.query('INSERT INTO epicrisis_assignments (epicrisis_id,user_id) VALUES ($1,$2)', [id, uid])
  return id
}
const VALID = new Set(['pending', 'in_review', 'reviewed', 'needs_expert_review'])

async function main() {
  const c = await pool.connect()
  const created = []
  const N = 8
  try {
    console.log(`E2E concurrencia · ${BASE} · ${N} repeticiones por caso\n`)

    // ── Caso 1: dos anotadores envían final en paralelo → debe quedar 'reviewed' ──
    console.log('Caso 1 — doble anotador simultáneo (ambos final) → reviewed')
    let ok1 = 0
    for (let i = 0; i < N; i++) {
      const e = await mk(c, [2, 3]); created.push(e)
      await Promise.all([
        api('/api/annotations', 'POST', A, { epicrisisId: e, criteria: crit(['c1', 'c2'], true), isFinal: true }),
        api('/api/annotations', 'POST', B, { epicrisisId: e, criteria: crit(['c1', 'c2'], true), isFinal: true }),
      ])
      const st = await dbStatus(c, e)
      if (st === 'reviewed') ok1++
      else console.log(`    iter ${i}: status=${st} (esperado reviewed — carrera de conteo)`)
    }
    check(`las ${N} iteraciones quedaron en 'reviewed' (sin quedar atascadas en in_review)`, ok1 === N, `(${ok1}/${N})`)

    // ── Caso 2: admin cierra mientras anotador envía (no-final) en paralelo ──
    console.log('\nCaso 2 — admin cierra vs anotador envía (mismo caso, en paralelo)')
    let consistent = 0, closeRespected = 0
    for (let i = 0; i < N; i++) {
      const e = await mk(c, [2, 3]); created.push(e)
      // derivar a needs_expert_review primero
      await api('/api/annotations', 'POST', A, { epicrisisId: e, criteria: crit(['u1', 'u2', 'u3'], 'unknown'), isFinal: true })
      // carrera: admin cierra  vs  B guarda borrador
      const [closeRes] = await Promise.all([
        api('/api/admin', 'POST', ADMIN, { action: 'closeExpertReview', epicrisisId: e }),
        api('/api/annotations', 'POST', B, { epicrisisId: e, criteria: crit(['d1'], true), isFinal: false }),
      ])
      const st = await dbStatus(c, e)
      // 1) el estado final debe ser SIEMPRE un valor válido del enum (sin torn write)
      if (VALID.has(st)) consistent++
      else console.log(`    iter ${i}: estado inválido=${st}`)
      // 2) si el cierre devolvió 200, su escritura NO debe perderse: no puede
      //    quedar en needs_expert_review (la intención del admin se respeta)
      if (closeRes.status === 200) { if (st !== 'needs_expert_review') closeRespected++ }
      else closeRespected++ // 409: el submit ganó la fila primero; aceptable y consistente
    }
    check(`estado final siempre válido (sin corrupción) en ${N} carreras`, consistent === N, `(${consistent}/${N})`)
    check('cuando el cierre devuelve 200, su escritura NO se pierde', closeRespected === N, `(${closeRespected}/${N})`)
  } finally {
    for (const id of created) await c.query('DELETE FROM epicrisis WHERE id=$1', [id])
    await c.query("DELETE FROM annotations WHERE criterion_name IN ('c1','c2','u1','u2','u3','d1')")
    c.release(); await pool.end()
  }
  console.log(`\n${fail === 0 ? '✅' : '❌'} ${pass} passed, ${fail} failed`)
  process.exit(fail === 0 ? 0 : 1)
}
main().catch(e => { console.error('ERROR:', e.message); process.exit(1) })
