import type { VercelRequest, VercelResponse } from '@vercel/node'
import { eq, and, getTableColumns } from 'drizzle-orm'
import { db, annotations, epicrisis, epicrisisClinicalData, epicrisisAssignments } from './_lib/db.js'
import { getAuthUser } from './_lib/auth.js'
import { cors } from './_lib/cors.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  cors(req, res)
  if (req.method === 'OPTIONS') return res.status(204).end()

  const authUser = await getAuthUser(req)
  if (!authUser) return res.status(401).json({ error: 'No autenticado' })

  const userId = Number(authUser.sub)

  if (req.method === 'GET') {
    const { epicrisisId } = req.query
    if (!epicrisisId) return res.status(400).json({ error: 'epicrisisId requerido' })

    const rows = await db
      .select()
      .from(annotations)
      .where(eq(annotations.epicrisisId, Number(epicrisisId)))

    return res.status(200).json({ annotations: rows })
  }

  if (req.method === 'POST') {
    const { epicrisisId, criteria, isFinal, epicrisisMetadata } = req.body
    if (!epicrisisId || !Array.isArray(criteria)) {
      return res.status(400).json({ error: 'Datos inválidos' })
    }

    const [doc] = await db
      .select()
      .from(epicrisis)
      .where(eq(epicrisis.id, Number(epicrisisId)))
      .limit(1)

    if (!doc) return res.status(404).json({ error: 'No encontrada' })

    const [assignment] = await db
      .select({ id: epicrisisAssignments.id })
      .from(epicrisisAssignments)
      .where(and(
        eq(epicrisisAssignments.epicrisisId, Number(epicrisisId)),
        eq(epicrisisAssignments.userId, userId),
      ))
      .limit(1)

    const isOwner = !!assignment || doc.assigneeId === userId || authUser.role === 'admin'
    if (!isOwner) return res.status(403).json({ error: 'Sin permiso' })

    const newStatus = isFinal ? 'reviewed' : 'in_review'

    // Solo borramos las anotaciones del usuario actual para no destruir datos de otros anotadores
    await db
      .delete(annotations)
      .where(and(
        eq(annotations.epicrisisId, Number(epicrisisId)),
        eq(annotations.userId, userId),
      ))

    // Insertamos las nuevas
    if (criteria.length > 0) {
      await db.insert(annotations).values(
        criteria.map((c: any) => ({
          epicrisisId: Number(epicrisisId),
          userId: userId, // Quién hizo el último cambio
          criterionName: c.criterionName,
          isPresent: c.isPresent,
          evidenceText: c.evidenceText,
          comments: c.comments,
        }))
      )
    }

    // Update epicrisis status
    await db
      .update(epicrisis)
      .set({
        status: newStatus,
        lockedBy: null,
        lockedAt: null,
        ...(epicrisisMetadata && {
          fechaIngresoHosp: epicrisisMetadata.fechaIngresoHosp ?? null,
          fechaEgresoHosp: epicrisisMetadata.fechaEgresoHosp ?? null,
          fechaIngresoUci: epicrisisMetadata.fechaIngresoUci ?? null,
          fechaEgresoUci: epicrisisMetadata.fechaEgresoUci ?? null,
          comentarioFinal: epicrisisMetadata.comentarioFinal ?? null,
        }),
      })
      .where(eq(epicrisis.id, Number(epicrisisId)))

    // Save clinical data to the new table if present
    if (epicrisisMetadata && epicrisisMetadata.clinicalData) {
      const { epicrisisId: _, ...clinicalDataToSave } = epicrisisMetadata.clinicalData
      
      // Filter valid keys based on schema columns
      const columns = getTableColumns(epicrisisClinicalData)
      const validKeys = Object.keys(columns)
      
      const filteredData: Record<string, any> = {}
      for (const key of Object.keys(clinicalDataToSave)) {
        if (validKeys.includes(key) && key !== 'epicrisisId') {
          filteredData[key] = clinicalDataToSave[key]
        }
      }

      if (Object.keys(filteredData).length > 0) {
        await db
          .insert(epicrisisClinicalData)
          .values({
            epicrisisId: Number(epicrisisId),
            ...filteredData,
          })
          .onConflictDoUpdate({
            target: epicrisisClinicalData.epicrisisId,
            set: filteredData,
          })
      } else {
        await db
          .insert(epicrisisClinicalData)
          .values({
            epicrisisId: Number(epicrisisId),
          })
          .onConflictDoNothing()
      }
    }

    return res.status(200).json({ ok: true, status: newStatus })
  }

  return res.status(405).json({ error: 'Método no permitido' })
}
