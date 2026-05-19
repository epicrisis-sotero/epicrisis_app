import type { VercelRequest, VercelResponse } from '@vercel/node'
import { eq, and } from 'drizzle-orm'
import { db, epicrisis, users, epicrisisClinicalData } from './_lib/db.js'
import { getAuthUser } from './_lib/auth.js'
import { cors } from './_lib/cors.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  cors(req, res)
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

    const result = await db
      .select()
      .from(epicrisis)
      .leftJoin(epicrisisClinicalData, eq(epicrisis.id, epicrisisClinicalData.epicrisisId))
      .where(and(...conditions))
      .limit(1)

    if (result.length === 0) return res.status(404).json({ error: 'Epicrisis no encontrada' })

    const row = result[0]
    const fullDoc = {
      ...row.epicrisis,
      clinicalData: row.epicrisis_clinical_data || null
    }

    return res.status(200).json({ epicrisis: fullDoc })
  }

  // List retrieval: Always filter by assigneeId (Personal Dashboard)
  // Even for admins, the dashboard should only show THEIR assigned tasks.
  // Global view is handled by /api/admin
  const list = await db
    .select({
      id: epicrisis.id,
      patientId: epicrisis.patientId,
      pdfPath: epicrisis.pdfPath,
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
