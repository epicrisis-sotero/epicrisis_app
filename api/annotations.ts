import type { VercelRequest, VercelResponse } from '@vercel/node'
import { eq, and, getTableColumns, sql } from 'drizzle-orm'
import { db, annotations, epicrisis, epicrisisClinicalData, epicrisisAssignments, annotationClinicalDifficulty } from './_lib/db.js'
import { getAuthUser } from './_lib/auth.js'
import { cors } from './_lib/cors.js'
import { notifyAnnotationSubmitted } from './_lib/notify.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  cors(req, res)
  if (req.method === 'OPTIONS') return res.status(204).end()

  const authUser = await getAuthUser(req)
  if (!authUser) return res.status(401).json({ error: 'No autenticado' })

  const userId = Number(authUser.sub)

  // ── GET — cargar anotaciones del usuario para una epicrisis ──────────────────
  if (req.method === 'GET') {
    const { epicrisisId } = req.query
    if (!epicrisisId) return res.status(400).json({ error: 'epicrisisId requerido' })

    const rows = await db
      .select()
      .from(annotations)
      .where(and(
        eq(annotations.epicrisisId, Number(epicrisisId)),
        eq(annotations.userId, userId),
      ))

    const clinicalDifficultyRows = await db
      .select()
      .from(annotationClinicalDifficulty)
      .where(and(
        eq(annotationClinicalDifficulty.epicrisisId, Number(epicrisisId)),
        eq(annotationClinicalDifficulty.userId, userId),
      ))

    const clinicalDifficulty: Record<string, { difficulty: string | null; notes: string }> = {}
    for (const r of clinicalDifficultyRows) {
      clinicalDifficulty[r.sectionName] = { difficulty: r.difficulty, notes: r.difficultyNotes ?? '' }
    }

    return res.status(200).json({ annotations: rows, clinicalDifficulty })
  }

  // ── POST — guardar anotaciones ───────────────────────────────────────────────
  if (req.method === 'POST') {
    const { epicrisisId, criteria, isFinal, epicrisisMetadata } = req.body
    if (!epicrisisId || !Array.isArray(criteria)) {
      return res.status(400).json({ error: 'Datos inválidos' })
    }

    const epicrisisIdNum = Number(epicrisisId)

    const [doc] = await db
      .select()
      .from(epicrisis)
      .where(eq(epicrisis.id, epicrisisIdNum))
      .limit(1)

    if (!doc) return res.status(404).json({ error: 'No encontrada' })

    // Verificar que el usuario está asignado a esta epicrisis
    const [assignment] = await db
      .select()
      .from(epicrisisAssignments)
      .where(and(
        eq(epicrisisAssignments.epicrisisId, epicrisisIdNum),
        eq(epicrisisAssignments.userId, userId),
      ))
      .limit(1)

    const isOwner = !!assignment || doc.assigneeId === userId || authUser.role === 'admin'
    if (!isOwner) return res.status(403).json({ error: 'Sin permiso' })

    // ── Guardar anotaciones (solo del usuario actual) ─────────────────────────
    await db
      .delete(annotations)
      .where(and(
        eq(annotations.epicrisisId, epicrisisIdNum),
        eq(annotations.userId, userId),
      ))

    if (criteria.length > 0) {
      await db.insert(annotations).values(
        criteria.map((c: any) => ({
          epicrisisId: epicrisisIdNum,
          userId,
          criterionName: c.criterionName,
          isPresent: c.isPresent === 'unknown' ? null : (c.isPresent ?? null),
          isUnknown: c.isPresent === 'unknown',
          difficulty: c.difficulty ?? null,
          difficultyNotes: c.difficultyNotes ?? null,
          evidenceText: c.evidenceText,
          comments: c.comments,
        }))
      )
    }

    // ── Determinar nuevo status basado en todas las asignaciones ──────────────
    // Con solapamiento: la epicrisis es 'reviewed' solo cuando TODOS los asignados
    // han hecho submit final. Cada asignado marca su completedAt independientemente.
    let newStatus: 'in_review' | 'reviewed'

    const allAssignments = await db
      .select({ completedAt: epicrisisAssignments.completedAt })
      .from(epicrisisAssignments)
      .where(eq(epicrisisAssignments.epicrisisId, epicrisisIdNum))

    if (allAssignments.length === 0) {
      // Legado: epicrisis sin fila en epicrisis_assignments (asignación directa antigua)
      newStatus = isFinal ? 'reviewed' : 'in_review'
    } else {
      // Marcar la asignación de ESTE usuario como completa/incompleta
      if (assignment) {
        await db
          .update(epicrisisAssignments)
          .set({ completedAt: isFinal ? new Date() : null })
          .where(eq(epicrisisAssignments.id, assignment.id))
      }

      // Contar cuántos asignados han completado (incluye la actualización recién hecha)
      const [{ total, completed }] = await db
        .select({
          total:     sql<number>`COUNT(*)`.mapWith(Number),
          completed: sql<number>`COUNT(CASE WHEN completed_at IS NOT NULL THEN 1 END)`.mapWith(Number),
        })
        .from(epicrisisAssignments)
        .where(eq(epicrisisAssignments.epicrisisId, epicrisisIdNum))

      newStatus = (completed === total && total > 0) ? 'reviewed' : 'in_review'
    }

    // Actualizar solo status y locks — las fechas se guardan per-user en clinical_data
    await db
      .update(epicrisis)
      .set({
        status: newStatus,
        lockedBy: null,
        lockedAt: null,
      })
      .where(eq(epicrisis.id, epicrisisIdNum))

    // ── Guardar datos clínicos per-user (incluyendo fechas y comentario) ───────
    if (epicrisisMetadata) {
      const columns = getTableColumns(epicrisisClinicalData)
      const validKeys = new Set(Object.keys(columns))
      const filteredData: Record<string, any> = {}

      // Campos del objeto clinicalData del frontend
      if (epicrisisMetadata.clinicalData) {
        for (const [key, val] of Object.entries(epicrisisMetadata.clinicalData as Record<string, any>)) {
          if (validKeys.has(key) && key !== 'epicrisisId' && key !== 'userId') {
            filteredData[key] = val
          }
        }
        // _unknowns (frontend) → unknownFields (columna DB)
        const unknowns = (epicrisisMetadata.clinicalData as any)._unknowns
        filteredData.unknownFields = Array.isArray(unknowns) ? unknowns : []
      }

      // Fechas y comentario final: per-user (NO van a la tabla epicrisis)
      if (epicrisisMetadata.fechaIngresoHosp !== undefined) filteredData.fechaIngresoHosp = epicrisisMetadata.fechaIngresoHosp ?? null
      if (epicrisisMetadata.fechaEgresoHosp  !== undefined) filteredData.fechaEgresoHosp  = epicrisisMetadata.fechaEgresoHosp  ?? null
      if (epicrisisMetadata.fechaIngresoUci  !== undefined) filteredData.fechaIngresoUci  = epicrisisMetadata.fechaIngresoUci  ?? null
      if (epicrisisMetadata.fechaEgresoUci   !== undefined) filteredData.fechaEgresoUci   = epicrisisMetadata.fechaEgresoUci   ?? null
      if (epicrisisMetadata.comentarioFinal  !== undefined) filteredData.comentarioFinal  = epicrisisMetadata.comentarioFinal  ?? null

      if (Object.keys(filteredData).length > 0) {
        await db
          .insert(epicrisisClinicalData)
          .values({ epicrisisId: epicrisisIdNum, userId, ...filteredData })
          .onConflictDoUpdate({
            target: [epicrisisClinicalData.epicrisisId, epicrisisClinicalData.userId],
            set: filteredData,
          })
      }

      // ── Dificultad por sección clínica ────────────────────────────────────────
      const clinicalDifficulty = epicrisisMetadata.clinicalDifficulty as
        | Record<string, { difficulty: string | null; notes: string }>
        | undefined

      if (clinicalDifficulty) {
        for (const [section, data] of Object.entries(clinicalDifficulty)) {
          await db
            .insert(annotationClinicalDifficulty)
            .values({
              epicrisisId: epicrisisIdNum,
              userId,
              sectionName: section,
              difficulty: data.difficulty ?? null,
              difficultyNotes: data.notes ?? null,
            })
            .onConflictDoUpdate({
              target: [
                annotationClinicalDifficulty.epicrisisId,
                annotationClinicalDifficulty.userId,
                annotationClinicalDifficulty.sectionName,
              ],
              set: { difficulty: data.difficulty ?? null, difficultyNotes: data.notes ?? null },
            })
        }
      }
    }

    // Notificación Telegram — solo en submit final, fire-and-forget
    if (isFinal) {
      const [{ total, completed }] = await db
        .select({
          total:     sql<number>`COUNT(*)`.mapWith(Number),
          completed: sql<number>`COUNT(CASE WHEN completed_at IS NOT NULL THEN 1 END)`.mapWith(Number),
        })
        .from(epicrisisAssignments)
        .where(eq(epicrisisAssignments.epicrisisId, epicrisisIdNum))

      notifyAnnotationSubmitted({
        epicrisisId:        epicrisisIdNum,
        patientId:          doc.patientId ?? null,
        annotatorEmail:     authUser.email,
        newStatus,
        totalAssignees:     total || 1,
        completedAssignees: completed || 1,
      })
    }

    return res.status(200).json({ ok: true, status: newStatus })
  }

  return res.status(405).json({ error: 'Método no permitido' })
}
