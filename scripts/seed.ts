import 'dotenv/config'
import pkg from 'pg'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const { Pool } = pkg
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.dirname(__dirname)

async function main() {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) throw new Error('DATABASE_URL is not set')

  const pool = new Pool({ connectionString })
  
  console.log('Reading seed_data.json...')
  const jsonData = JSON.parse(fs.readFileSync(path.join(__dirname, 'seed_data.json'), 'utf-8'))

  console.log('Cleaning old data (TRUNCATE epicrisis CASCADE)...')
  try {
    await pool.query('TRUNCATE TABLE epicrisis CASCADE')
    
    console.log(`Inserting ${jsonData.length} epicrisis...`)
    
    for (const item of jsonData) {
      // Verificar si existe el archivo PDF correspondiente
      const pdfFileName = `${item.patientId}.pdf`
      const pdfFilePath = path.join(ROOT, 'uploads', pdfFileName)
      let pdfPath: string | null = null
      let pdfBuffer: Buffer | null = null

      if (fs.existsSync(pdfFilePath)) {
        pdfPath = pdfFileName
        pdfBuffer = fs.readFileSync(pdfFilePath)
      }

      await pool.query(
        `INSERT INTO epicrisis (
          patient_id, pdf_path, pdf_data, direccion, quintil_estimado, prevision, tipo_prevision,
          quintil_teorico, concordancia_gse, hacinamiento_manzana, confianza_geocodificacion,
          estado_mortalidad, fecha_ingreso_hosp, fecha_egreso_hosp, fecha_ingreso_uci,
          fecha_egreso_uci, comentario_final, content_markdown, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, 'pending')`,
        [
          item.patientId, pdfPath, pdfBuffer, item.direccion, item.quintilEstimado, item.prevision, item.tipoPrevision,
          item.quintilTeorico, item.concordanciaGse, item.hacinamientoManzana, item.confianzaGeocodificacion,
          item.estadoMortalidad, item.fechaIngresoHosp, item.fechaEgresoHosp, item.fechaIngresoUci,
          item.fechaEgresoUci, item.comentarioFinal, item.contentMarkdown
        ]
      )
    }
    
    console.log(`✓ Seed complete: ${jsonData.length} records processed and populated.`)
  } catch (e) {
    console.error('Error during seed:', e)
  } finally {
    await pool.end()
  }
}

main()
