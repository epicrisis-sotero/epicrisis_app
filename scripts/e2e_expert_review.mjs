// E2E: derivación a revisión experta (HU-001 admin) contra la API+DB reales.
// Crea datos temporales, ejercita el flujo vía HTTP y limpia al final.
//   node scripts/e2e_expert_review.mjs
import 'dotenv/config'
import pg from 'pg'
import { SignJWT } from 'jose'

const BASE = process.env.E2E_BASE || 'http://localhost:3001'
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
const secret = new TextEncoder().encode(process.env.JWT_SECRET)

const ADMIN = { sub: '1', email: 'admin@epicrisis.cl', role: 'admin' }
const A = { sub: '2', email: 'estudiante1@epicrisis.cl', role: 'annotator' }
const B = { sub: '3', email: 'estudiante2@epicrisis.cl', role: 'annotator' }

const token = (u) => new SignJWT({ ...u }).setProtectedHeader({ alg: 'HS256' }).setIssuedAt().setExpirationTime('7d').sign(secret)

let pass = 0, fail = 0
function check(name, cond, extra = '') {
  if (cond) { pass++; console.log(`  ✓ ${name}`) }
  else { fail++; console.log(`  ✗ ${name} ${extra}`) }
}

async function api(path, method, user, body) {
  const res = await fetch(BASE + path, {
    method,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${await token(user)}` },
    body: body ? JSON.stringify(body) : undefined,
  })
  let json = null
  try { json = await res.json() } catch {}
  return { status: res.status, json }
}

const crit = (n, val, prefix = 'e2e_crit') => Array.from({ length: n }, (_, i) => ({
  criterionName: `${prefix}_${i}`, isPresent: val, evidenceText: null, comments: null,
}))

async function dbStatus(c, id) {
  const { rows } = await c.query('SELECT status FROM epicrisis WHERE id=$1', [id])
  return rows[0]?.status
}
async function mkEpicrisis(c, assignees) {
  const { rows } = await c.query("INSERT INTO epicrisis (patient_id, status) VALUES ('E2E-TEST','pending') RETURNING id")
  const id = rows[0].id
  for (const uid of assignees) await c.query('INSERT INTO epicrisis_assignments (epicrisis_id,user_id) VALUES ($1,$2)', [id, uid])
  return id
}

async function main() {
  const c = await pool.connect()
  const created = []
  try {
    console.log(`E2E derivación a experto · ${BASE} · umbral=${process.env.EXPERT_REVIEW_UNKNOWN_THRESHOLD ?? 3}\n`)

    // ── Caso 1: trigger por umbral (A envía con 3 unknowns) ──
    console.log('Caso 1 — trigger: ≥3 unknowns deriva a needs_expert_review')
    const e1 = await mkEpicrisis(c, [2, 3]); created.push(e1)
    const r1 = await api('/api/annotations', 'POST', A, { epicrisisId: e1, criteria: crit(3, 'unknown'), isFinal: true })
    check('respuesta 200', r1.status === 200, `(got ${r1.status} ${JSON.stringify(r1.json)})`)
    check("API devuelve status 'needs_expert_review'", r1.json?.status === 'needs_expert_review', `(got ${r1.json?.status})`)
    check('DB quedó en needs_expert_review', (await dbStatus(c, e1)) === 'needs_expert_review')

    // ── Caso 2: sticky — B completa sin unknowns, NO debe degradar ──
    console.log('\nCaso 2 — sticky: el 2º anotador completa y NO degrada el estado')
    const r2 = await api('/api/annotations', 'POST', B, { epicrisisId: e1, criteria: crit(3, true), isFinal: true })
    check('respuesta 200', r2.status === 200, `(got ${r2.status})`)
    check('sigue en needs_expert_review (no pasó a reviewed)', (await dbStatus(c, e1)) === 'needs_expert_review', `(got ${await dbStatus(c, e1)})`)

    // ── Caso 3: admin cierra la revisión → reviewed ──
    console.log('\nCaso 3 — admin cierra la revisión experta → reviewed')
    const r3 = await api('/api/admin', 'POST', ADMIN, { action: 'closeExpertReview', epicrisisId: e1 })
    check('respuesta 200', r3.status === 200, `(got ${r3.status} ${JSON.stringify(r3.json)})`)
    check("API devuelve status 'reviewed'", r3.json?.status === 'reviewed', `(got ${r3.json?.status})`)
    check('DB quedó en reviewed', (await dbStatus(c, e1)) === 'reviewed')

    // ── Caso 3b: closeExpertReview sobre algo que NO está en revisión → 409 ──
    const r3b = await api('/api/admin', 'POST', ADMIN, { action: 'closeExpertReview', epicrisisId: e1 })
    check('cerrar de nuevo da 409 (ya no está en revisión)', r3b.status === 409, `(got ${r3b.status})`)

    // ── Caso 4: bajo umbral (2 unknowns) NO deriva ──
    console.log('\nCaso 4 — bajo umbral: 2 unknowns NO deriva')
    const e2 = await mkEpicrisis(c, [2]); created.push(e2)
    const r4 = await api('/api/annotations', 'POST', A, { epicrisisId: e2, criteria: [...crit(2, 'unknown', 'e2eU'), ...crit(3, true, 'e2eP')], isFinal: true })
    check('respuesta 200', r4.status === 200, `(got ${r4.status})`)
    check("NO derivó (quedó 'reviewed', único anotador completó)", (await dbStatus(c, e2)) === 'reviewed', `(got ${await dbStatus(c, e2)})`)

    // ── Caso 5: closeExpertReview por un anotador → 403 ──
    console.log('\nCaso 5 — un anotador no puede cerrar revisión (403)')
    const e3 = await mkEpicrisis(c, [2, 3]); created.push(e3)
    await api('/api/annotations', 'POST', A, { epicrisisId: e3, criteria: crit(4, 'unknown'), isFinal: true })
    const r5 = await api('/api/admin', 'POST', A, { action: 'closeExpertReview', epicrisisId: e3 })
    check('anotador recibe 403', r5.status === 403, `(got ${r5.status})`)
    check('sigue en needs_expert_review', (await dbStatus(c, e3)) === 'needs_expert_review')
  } finally {
    // cleanup
    for (const id of created) await c.query('DELETE FROM epicrisis WHERE id=$1', [id])
    await c.query("DELETE FROM annotations WHERE criterion_name LIKE 'e2e%'")
    c.release(); await pool.end()
  }
  console.log(`\n${fail === 0 ? '✅' : '❌'} ${pass} passed, ${fail} failed`)
  process.exit(fail === 0 ? 0 : 1)
}
main().catch((e) => { console.error('ERROR:', e.message); process.exit(1) })
