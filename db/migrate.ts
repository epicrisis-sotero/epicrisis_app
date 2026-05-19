import 'dotenv/config'
import pkg from 'pg'
import { drizzle } from 'drizzle-orm/node-postgres'
import { migrate } from 'drizzle-orm/node-postgres/migrator'
import { users } from './schema.js'
import { eq } from 'drizzle-orm'

const { Pool } = pkg

async function main() {
  const connectionString = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL
  if (!connectionString) throw new Error('DATABASE_URL or DATABASE_URL_UNPOOLED is not set')

  const pool = new Pool({ connectionString })
  const db = drizzle(pool)

  console.log('Running migrations...')
  await migrate(db, { migrationsFolder: 'db/migrations' })
  console.log('✓ Migrations complete')

  // Idempotent user seed
  const existing = await db.select().from(users).where(eq(users.email, 'admin@epicrisis.cl'))
  if (existing.length === 0) {
    await db.insert(users).values([
      {
        email: 'admin@epicrisis.cl',
        passwordHash: '$2a$12$uPvrQclNVplSwp1XVyPt6uxdt7wfo8v54ylX4yEObW6wiDMOPtufi',
        role: 'admin',
      },
      {
        email: 'estudiante1@epicrisis.cl',
        passwordHash: '$2a$12$PoVpjYlmYMJa4aG.fRfib.LK5IwYDpwpj4.IOKGcFKg1zb6tqV4TW',
        role: 'annotator',
      },
      {
        email: 'estudiante2@epicrisis.cl',
        passwordHash: '$2a$12$dm25WFPVt.pSMnDAp0zRKuj3P83O/dex7cGwqUeGeuNA3wzr9cjpu',
        role: 'annotator',
      },
      {
        email: 'estudiante3@epicrisis.cl',
        passwordHash: '$2a$12$o5gu0nISEdLEDPzwS/n9/eTe06MQvS1GqLBBByPzm2d92h/Q0/UqG',
        role: 'annotator',
      },
    ])
    console.log('✓ Users seeded')
  } else {
    console.log('✓ Users already exist, skipping seed')
  }

  await pool.end()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
