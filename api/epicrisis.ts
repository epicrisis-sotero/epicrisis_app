import type { VercelRequest, VercelResponse } from '@vercel/node'
import { eq, and } from 'drizzle-orm'
import { db, epicrisis, users } from './_lib/db.js'
import { getAuthUser } from './_lib/auth.js'

function cors(res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', process.env.CORS_ORIGIN ?? '*')
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  cors(res)
  if (req.method === 'OPTIONS') return res.status(204).end()
  if (req.method !== 'GET') return res.status(405).json({ error: 'Método no permitido' })

  const authUser = await getAuthUser(req)
  if (!authUser) return res.status(401).json({ error: 'No autenticado' })

  const userId = Number(authUser.sub)
  const { id } = req.query

  // Individual retrieval: Admins can see any, Annotators only their own
  if (id) {
    const epicrisisId = Number(id)
    if (isNaN(epicrisisId)) return res.status(400).json({ error: 'ID inválido' })

    const isAdmin = authUser.role === 'admin'
    const conditions = isAdmin
      ? [eq(epicrisis.id, epicrisisId)]
      : [eq(epicrisis.id, epicrisisId), eq(epicrisis.assigneeId, userId)]

    const [doc] = await db
      .select()
      .from(epicrisis)
      .where(and(...conditions))
      .limit(1)

    if (!doc) return res.status(404).json({ error: 'Epicrisis no encontrada' })

    return res.status(200).json({ epicrisis: doc })
  }

  // List retrieval: Always filter by assigneeId (Personal Dashboard)
  // Even for admins, the dashboard should only show THEIR assigned tasks.
  // Global view is handled by /api/admin
  const list = await db
    .select({
      id: epicrisis.id,
      status: epicrisis.status,
      assigneeId: epicrisis.assigneeId,
      createdAt: epicrisis.createdAt,
      assigneeEmail: users.email,
    })
    .from(epicrisis)
    .leftJoin(users, eq(epicrisis.assigneeId, users.id))
    .where(eq(epicrisis.assigneeId, userId))
    .orderBy(epicrisis.id)

  return res.status(200).json({ epicrises: list })
}
