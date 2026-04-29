import { neon } from '@neondatabase/serverless'
import dotenv from 'dotenv'

dotenv.config()

async function fix() {
  const sql = neon(process.env.DATABASE_URL!)
  
  console.log('Verificando columnas en tabla epicrisis...')
  try {
    await sql`ALTER TABLE epicrisis ADD COLUMN IF NOT EXISTS locked_by integer REFERENCES users(id)`
    console.log('Columna locked_by verificada/creada.')
    
    await sql`ALTER TABLE epicrisis ADD COLUMN IF NOT EXISTS locked_at timestamp`
    console.log('Columna locked_at verificada/creada.')
    
    console.log('Base de datos actualizada correctamente.')
  } catch (error) {
    console.error('Error al actualizar la base de datos:', error)
  }
}

fix()
