// E2E integración: annotations + estado + auth + clinical_data, contra API+DB reales.
//   node scripts/e2e_annotations.mjs
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
const check = (n, cond, extra = '') => {
  if (cond) { pass++; console.log(`  ✓ ${n}`) } else { fail++; console.log(`  ✗ ${n} ${extra}`) }
}

async function api(path, method, userOrToken, body) {
  const headers = { 'Content-Type': 'application/json' }
  if (userOrToken === 'NONE') { /* sin auth */ }
  else if (typeof userOrToken === 'string') headers.Authorization = `Bearer ${userOrToken}`
  else headers.Authorization = `Bearer ${await tok(userOrToken)}`
  const res = await fetch(BASE + path, { method, headers, body: body ? JSON.stringify(body) : undefined })
  let json = null; try { json = await res.json() } catch {}
  return { status: res.status, json }
}

const crit = (names, val) => names.map(n => ({ criterionName: n, isPresent: val, evidenceText: null, comments: null }))

async function dbStatus(c, id) { return (await c.query('SELECT status FROM epicrisis WHERE id=$1', [id])).rows[0]?.status }
async function annCount(c, id, uid) {
  return Number((await c.query('SELECT count(*) FROM annotations WHERE epicrisis_id=$1 AND user_id=$2', [id, uid])).rows[0].count)
}
async function clinRows(c, id) {
  return Number((await c.query('SELECT count(*) FROM epicrisis_clinical_data WHERE epicrisis_id=$1', [id])).rows[0].count)
}
async function mk(c, assignees) {
  const id = (await c.query("INSERT INTO epicrisis (patient_id,status) VALUES ('E2E-ANN','pending') RETURNING id")).rows[0].id
  for (const uid of assignees) await c.query('INSERT INTO epicrisis_assignments (epicrisis_id,user_id) VALUES ($1,$2)', [id, uid])
  return id
}

async function main() {
  const c = await pool.connect()
  const created = []
  try {
    console.log(`E2E annotations · ${BASE}\n`)

    // ── AUTH ──────────────────────────────────────────────────────────────────
    console.log('Auth')
    check('sin token → 401', (await api('/api/annotations?epicrisisId=1', 'GET', 'NONE')).status === 401)
    check('token inválido → 401', (await api('/api/annotations?epicrisisId=1', 'GET', 'token.basura.aqui')).status === 401)
    check('anotador en endpoint admin → 403', (await api('/api/admin?resource=epicrisis', 'GET', A)).status === 403)
    // rol stale: token dice admin, pero user 2 es annotator en DB → admin.ts re-chequea
    const staleToken = await tok({ sub: '2', email: 'estudiante1@epicrisis.cl', role: 'admin' })
    check('rol "admin" en token pero annotator en DB → 403', (await api('/api/admin?resource=epicrisis', 'GET', staleToken)).status === 403)

    // ── MULTI-ANOTADOR: derivación de estado ────────────────────────────────────
    console.log('\nMulti-anotador — derivación de estado')
    const e1 = await mk(c, [2, 3]); created.push(e1)
    await api('/api/annotations', 'POST', A, { epicrisisId: e1, criteria: crit(['c1', 'c2'], true), isFinal: true })
    check('1 de 2 completó → in_review', (await dbStatus(c, e1)) === 'in_review', `(got ${await dbStatus(c, e1)})`)
    await api('/api/annotations', 'POST', B, { epicrisisId: e1, criteria: crit(['c1', 'c2'], true), isFinal: true })
    check('2 de 2 completaron → reviewed', (await dbStatus(c, e1)) === 'reviewed', `(got ${await dbStatus(c, e1)})`)

    // ── CLINICAL DATA per-user (clave compuesta) ────────────────────────────────
    console.log('\nClinical data per-user')
    const e2 = await mk(c, [2, 3]); created.push(e2)
    await api('/api/annotations', 'POST', A, { epicrisisId: e2, criteria: crit(['c1'], true), isFinal: false, epicrisisMetadata: { clinicalData: { vmi: true, vmiEvidencia: 'A', _unknowns: [] } } })
    await api('/api/annotations', 'POST', B, { epicrisisId: e2, criteria: crit(['c1'], true), isFinal: false, epicrisisMetadata: { clinicalData: { vmi: false, vmiEvidencia: 'B', _unknowns: [] } } })
    check('2 anotadores → 2 filas independientes en clinical_data', (await clinRows(c, e2)) === 2, `(got ${await clinRows(c, e2)})`)
    // doble submit del mismo user → upsert, no duplica
    await api('/api/annotations', 'POST', A, { epicrisisId: e2, criteria: crit(['c1'], true), isFinal: false, epicrisisMetadata: { clinicalData: { vmi: true, vmiEvidencia: 'A2', _unknowns: [] } } })
    check('re-submit del mismo user → upsert (sigue 2 filas)', (await clinRows(c, e2)) === 2, `(got ${await clinRows(c, e2)})`)

    // ── ESCRITURA PARCIAL / pérdida de datos ────────────────────────────────────
    console.log('\nEscritura parcial — un re-submit inválido NO debe borrar lo guardado')
    const e3 = await mk(c, [2]); created.push(e3)
    await api('/api/annotations', 'POST', A, { epicrisisId: e3, criteria: crit(['x1', 'x2', 'x3'], true), isFinal: false })
    check('guardó 3 anotaciones', (await annCount(c, e3, 2)) === 3, `(got ${await annCount(c, e3, 2)})`)
    const bad = await api('/api/annotations', 'POST', A, { epicrisisId: e3, criteria: crit(['dup', 'dup'], true), isFinal: false })
    check('payload duplicado → 500 (no crashea)', bad.status === 500, `(got ${bad.status})`)
    check('API sigue viva tras el error', (await api('/api/annotations?epicrisisId=' + e3, 'GET', A)).status === 200)
    check('las 3 anotaciones previas NO se perdieron (atomicidad)', (await annCount(c, e3, 2)) === 3, `(got ${await annCount(c, e3, 2)} — pérdida de datos si es 0)`)

    // ── needs_expert_review se mantiene al reasignar (PATCH admin) ──────────────
    console.log('\nSticky a través de reasignación (admin PATCH)')
    const e4 = await mk(c, [2, 3]); created.push(e4)
    await api('/api/annotations', 'POST', A, { epicrisisId: e4, criteria: crit(['u1', 'u2', 'u3'], 'unknown'), isFinal: true })
    check('derivó a needs_expert_review', (await dbStatus(c, e4)) === 'needs_expert_review')
    await api('/api/admin', 'PATCH', ADMIN, { epicrisisId: e4, userIds: [2] }) // reasignar solo a A
    check('tras reasignar sigue en needs_expert_review (sticky)', (await dbStatus(c, e4)) === 'needs_expert_review', `(got ${await dbStatus(c, e4)})`)
  } finally {
    for (const id of created) await c.query('DELETE FROM epicrisis WHERE id=$1', [id])
    await c.query("DELETE FROM annotations WHERE criterion_name IN ('c1','c2','x1','x2','x3','dup','u1','u2','u3')")
    c.release(); await pool.end()
  }
  console.log(`\n${fail === 0 ? '✅' : '❌'} ${pass} passed, ${fail} failed`)
  process.exit(fail === 0 ? 0 : 1)
}
main().catch(e => { console.error('ERROR:', e.message); process.exit(1) })
