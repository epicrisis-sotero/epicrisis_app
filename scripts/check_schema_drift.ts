// Verifica que la DB real tenga TODAS las columnas que define schema.ts.
// Detecta la deriva peligrosa: el código espera una columna que la DB no tiene
// (haría crashear queries en prod). El directorio de migraciones de Drizzle está
// desincronizado a propósito (se aplica DDL directo), así que este check es la
// red de seguridad antes de un deploy.
//   npx tsx scripts/check_schema_drift.ts
import 'dotenv/config'
import pg from 'pg'
import { getTableColumns, getTableName } from 'drizzle-orm'
import {
  users, epicrisis, annotations, epicrisisAssignments,
  epicrisisSections, epicrisisClinicalData, annotationClinicalDifficulty,
} from '../db/schema.js'

const tables = [
  users, epicrisis, annotations, epicrisisAssignments,
  epicrisisSections, epicrisisClinicalData, annotationClinicalDifficulty,
]

async function main() {
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
  const c = await pool.connect()
  let missingTotal = 0
  try {
    for (const t of tables) {
      const tableName = getTableName(t)
      const expected = Object.values(getTableColumns(t)).map((col: any) => col.name)
      const { rows } = await c.query(
        'SELECT column_name FROM information_schema.columns WHERE table_name=$1',
        [tableName],
      )
      const actual = new Set(rows.map(r => r.column_name))
      const missing = expected.filter(name => !actual.has(name))
      const extra = [...actual].filter(name => !expected.includes(name))

      if (missing.length === 0) {
        console.log(`  ✓ ${tableName} (${expected.length} columnas)`)
      } else {
        missingTotal += missing.length
        console.log(`  ✗ ${tableName} — FALTAN en la DB: ${missing.join(', ')}`)
      }
      if (extra.length) console.log(`    (info) columnas en DB no usadas por el schema: ${extra.join(', ')}`)
    }
  } finally {
    c.release(); await pool.end()
  }
  console.log(`\n${missingTotal === 0 ? '✅ schema y DB alineados' : `❌ ${missingTotal} columna(s) faltante(s) — riesgo de crash en prod`}`)
  process.exit(missingTotal === 0 ? 0 : 1)
}
main().catch(e => { console.error('ERROR:', e.message); process.exit(1) })
