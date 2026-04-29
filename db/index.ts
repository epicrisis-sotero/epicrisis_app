import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from './schema.js'

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  // En desarrollo local esto puede ser normal si no hay .env, 
  // pero en Vercel causará un error 500.
  console.warn('DATABASE_URL is not defined')
}

const sql = neon(connectionString!)
export const db = drizzle(sql, { schema })

export * from './schema.js'
