import type { VercelRequest, VercelResponse } from '@vercel/node'
import { eq } from 'drizzle-orm'
import { db, annotations, epicrisis, epicrisisClinicalData } from './_lib/db.js'
import { getAuthUser } from './_lib/auth.js'

function cors(res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', process.env.CORS_ORIGIN ?? '*')
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  cors(res)
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

    const isOwner = doc.assigneeId === userId || authUser.role === 'admin'
    if (!isOwner) return res.status(403).json({ error: 'Sin permiso' })

    const newStatus = isFinal ? 'reviewed' : 'in_review'

    await db.transaction(async (tx) => {
      // Nuclear: Borramos todas las anotaciones de esta epicrisis (de cualquier autor)
      await tx
        .delete(annotations)
        .where(eq(annotations.epicrisisId, Number(epicrisisId)))

      // Insertamos las nuevas
      if (criteria.length > 0) {
        await tx.insert(annotations).values(
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
      await tx
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
        await tx
          .insert(epicrisisClinicalData)
          .values({
            epicrisisId: Number(epicrisisId),
            ...clinicalDataToSave,
          })
          .onConflictDoUpdate({
            target: epicrisisClinicalData.epicrisisId,
            set: clinicalDataToSave,
          })
      }
    })

    return res.status(200).json({ ok: true, status: newStatus })
  }

  return res.status(405).json({ error: 'Método no permitido' })
}
