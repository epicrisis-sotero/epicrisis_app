/**
 * Sincroniza content_markdown desde seed_data.json a la base de datos Neon.
 * Usa UPDATE ... WHERE patient_id = $1 (no TRUNCATE).
 */
import 'dotenv/config'
import { neon } from '@neondatabase/serverless'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const sql = neon(process.env.DATABASE_URL!)

interface SeedRecord {
  patientId: string
  contentMarkdown: string
  [key: string]: unknown
}

async function main() {
  const data: SeedRecord[] = JSON.parse(
    readFileSync(join(__dirname, 'seed_data.json'), 'utf-8')
  )
  console.log(`Sincronizando ${data.length} registros con Neon…`)

  let updated = 0
  let notFound = 0

  for (const record of data) {
    const result = await sql`
      UPDATE epicrisis
      SET content_markdown = ${record.contentMarkdown}
      WHERE patient_id = ${record.patientId}
      RETURNING id
    `
    if (result.length > 0) {
      updated++
    } else {
      notFound++
    }
    if (updated % 50 === 0 && updated > 0) {
      process.stdout.write(`\r  Actualizados: ${updated}…`)
    }
  }

  console.log(`\n✓ Listo. ${updated} registros actualizados, ${notFound} no encontrados.`)
}

main().catch(e => { console.error(e); process.exit(1) })
