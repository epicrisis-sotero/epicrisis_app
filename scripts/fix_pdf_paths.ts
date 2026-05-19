import 'dotenv/config'
import pkg from 'pg'
const { Pool } = pkg

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL })

  const { rowCount } = await pool.query(`
    UPDATE epicrisis
    SET pdf_path = patient_id || '.pdf'
    WHERE pdf_data IS NOT NULL
      AND (pdf_path IS NULL OR pdf_path = '')
  `)

  console.log(`Listo: ${rowCount} registros actualizados con pdf_path.`)
  await pool.end()
}

main().catch(e => { console.error(e); process.exit(1) })
