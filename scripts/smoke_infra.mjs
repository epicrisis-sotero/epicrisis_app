// Smoke de infraestructura: API local viva, CORS bien configurado, túnel arriba.
//   node scripts/smoke_infra.mjs
import 'dotenv/config'

const LOCAL = process.env.E2E_BASE || 'http://localhost:3001'
const CORS_ORIGIN = (process.env.CORS_ORIGIN || '').split(',')[0]?.trim()
const NGROK = process.env.NGROK_URL

let pass = 0, fail = 0, warn = 0
const check = (n, cond, extra = '') => { if (cond) { pass++; console.log(`  ✓ ${n}`) } else { fail++; console.log(`  ✗ ${n} ${extra}`) } }
const soft = (n, cond, extra = '') => { if (cond) { pass++; console.log(`  ✓ ${n}`) } else { warn++; console.log(`  ⚠ ${n} ${extra}`) } }

async function preflight(base, origin) {
  const res = await fetch(base + '/api/annotations', {
    method: 'OPTIONS',
    headers: { Origin: origin, 'Access-Control-Request-Method': 'GET' },
  })
  return { status: res.status, acao: res.headers.get('access-control-allow-origin') }
}

async function main() {
  console.log(`Smoke infra · local=${LOCAL} · ngrok=${NGROK ? 'set' : 'NO SET'}\n`)

  // ── API local viva ──
  console.log('API local')
  try {
    const r = await fetch(LOCAL + '/api/annotations', { method: 'GET' })
    check('responde (401 sin token)', r.status === 401, `(got ${r.status})`)
  } catch (e) { check('responde', false, `(${e.message})`) }

  // ── CORS ──
  console.log('\nCORS')
  if (!CORS_ORIGIN || CORS_ORIGIN === '*') {
    soft('CORS_ORIGIN configurado (no es "*" ni vacío)', false, `(valor: "${CORS_ORIGIN || ''}")`)
  } else {
    const allowed = await preflight(LOCAL, CORS_ORIGIN)
    check('preflight OPTIONS → 204', allowed.status === 204, `(got ${allowed.status})`)
    check('origin permitido se refleja en Access-Control-Allow-Origin', allowed.acao === CORS_ORIGIN, `(got ${allowed.acao})`)
    const bogus = await preflight(LOCAL, 'https://evil.example.com')
    check('origin NO permitido NO se refleja', bogus.acao !== 'https://evil.example.com', `(got ${bogus.acao})`)
  }

  // ── Túnel ngrok (estado externo → soft) ──
  console.log('\nTúnel ngrok')
  if (!NGROK) {
    soft('NGROK_URL configurado', false)
  } else {
    try {
      const r = await fetch(NGROK + '/api/annotations', { method: 'GET', headers: { 'ngrok-skip-browser-warning': '1' } })
      soft('túnel alcanza el backend (401 esperado)', r.status === 401, `(got ${r.status} — si no es 401, el túnel o el backend están caídos)`)
    } catch (e) { soft('túnel alcanzable', false, `(${e.message} — túnel caído)`) }
  }

  console.log(`\n${fail === 0 ? '✅' : '❌'} ${pass} ok, ${warn} warn, ${fail} fail`)
  process.exit(fail === 0 ? 0 : 1)
}
main().catch(e => { console.error('ERROR:', e.message); process.exit(1) })
