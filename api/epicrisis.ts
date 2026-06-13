import type { VercelRequest, VercelResponse } from '@vercel/node'
import { eq, and, getTableColumns, asc, sql } from 'drizzle-orm'
import { db, epicrisis, users, epicrisisClinicalData, epicrisisSections, epicrisisAssignments } from './_lib/db.js'
import { getAuthUser } from './_lib/auth.js'
import { cors } from './_lib/cors.js'
import { withErrors } from './_lib/handler.js'

// Excluir pdfData (binario, solo lo sirve el endpoint /uploads)
const { pdfData: _pdfData, ...epicrisisColumns } = getTableColumns(epicrisis)

async function handler(req: VercelRequest, res: VercelResponse) {
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

    // Non-admins: must be in epicrisis_assignments for this epicrisis
    if (!isAdmin) {
      const [asgn] = await db
        .select({ id: epicrisisAssignments.id })
        .from(epicrisisAssignments)
        .where(and(
          eq(epicrisisAssignments.epicrisisId, epicrisisId),
          eq(epicrisisAssignments.userId, userId),
        ))
        .limit(1)
      if (!asgn) return res.status(404).json({ error: 'Epicrisis no encontrada' })
    }

    const conditions = [eq(epicrisis.id, epicrisisId)]

    const result = await db
      .select({ epicrisis: epicrisisColumns, epicrisis_clinical_data: getTableColumns(epicrisisClinicalData) })
      .from(epicrisis)
      .leftJoin(epicrisisClinicalData, and(
        eq(epicrisis.id, epicrisisClinicalData.epicrisisId),
        eq(epicrisisClinicalData.userId, userId),
      ))
      .where(and(...conditions))
      .limit(1)

    if (result.length === 0) return res.status(404).json({ error: 'Epicrisis no encontrada' })

    const sections = await db
      .select({
        sectionName: epicrisisSections.sectionName,
        label: epicrisisSections.label,
        content: epicrisisSections.content,
        position: epicrisisSections.position,
      })
      .from(epicrisisSections)
      .where(eq(epicrisisSections.epicrisisId, epicrisisId))
      .orderBy(asc(epicrisisSections.position))

    const row = result[0]
    const cd = row.epicrisis_clinical_data

    // Fechas: preferir el valor capturado por el anotador (per-user) sobre la extracción automática.
    // Esto garantiza que dos anotadores vean y guarden sus propias fechas sin pisarse.
    const fullDoc = {
      ...row.epicrisis,
      fechaIngresoHosp: cd?.fechaIngresoHosp ?? row.epicrisis.fechaIngresoHosp,
      fechaEgresoHosp:  cd?.fechaEgresoHosp  ?? row.epicrisis.fechaEgresoHosp,
      fechaIngresoUci:  cd?.fechaIngresoUci  ?? row.epicrisis.fechaIngresoUci,
      fechaEgresoUci:   cd?.fechaEgresoUci   ?? row.epicrisis.fechaEgresoUci,
      comentarioFinal:  cd?.comentarioFinal  ?? row.epicrisis.comentarioFinal,
      clinicalData: cd || null,
      sections,
    }

    return res.status(200).json({ epicrisis: fullDoc })
  }

  // List retrieval: show epicrisis where user is in epicrisis_assignments
  // Even for admins, the dashboard only shows THEIR assigned tasks.
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
    .innerJoin(epicrisisAssignments, and(
      eq(epicrisis.id, epicrisisAssignments.epicrisisId),
      eq(epicrisisAssignments.userId, userId),
    ))
    .orderBy(epicrisis.id)

  return res.status(200).json({ epicrises: list })
}

export default withErrors(handler)
