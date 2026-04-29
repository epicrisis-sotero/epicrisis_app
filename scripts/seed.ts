import 'dotenv/config'
import pkg from 'pg'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const { Pool } = pkg
const __dirname = path.dirname(fileURLToPath(import.meta.url))

async function main() {
  const connectionString = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL
  if (!connectionString) throw new Error('DATABASE_URL is not set')

  const pool = new Pool({ connectionString })
  
  console.log('Reading seed file...')
  const sql = fs.readFileSync(path.join(__dirname, 'seed_epicrisis.sql'), 'utf-8')

  console.log('Executing seed...')
  try {
    await pool.query(sql)
    console.log('✓ Seed complete')
  } catch (e) {
    console.error('Error during seed:', e)
  } finally {
    await pool.end()
  }
}

main()
