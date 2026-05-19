import pg from 'pg'
import { drizzle } from 'drizzle-orm/node-postgres'
import * as schema from './schema.js'

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  console.warn('DATABASE_URL is not defined')
}

export const pool = new pg.Pool({
  connectionString,
})

export const db = drizzle(pool, { schema })

export * from './schema.js'
