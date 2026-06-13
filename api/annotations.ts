import type { VercelRequest, VercelResponse } from '@vercel/node'
import { eq, and, getTableColumns, sql } from 'drizzle-orm'
import { db, annotations, epicrisis, epicrisisClinicalData, epicrisisAssignments, annotationClinicalDifficulty } from './_lib/db.js'
import { getAuthUser } from './_lib/auth.js'
import { cors } from './_lib/cors.js'
import { notifyAnnotationSubmitted } from './_lib/notify.js'
import { withErrors } from './_lib/handler.js'

async function handler(req: VercelRequest, res: VercelResponse) {
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

    // ── Escritura atómica del submit ──────────────────────────────────────────
    // Todo el camino de escritura (anotaciones + estado + datos clínicos +
    // dificultad) va en UNA transacción. Si algo falla, rollback completo: ni
    // pérdida de anotaciones ni estado inconsistente.
    let newStatus: 'in_review' | 'reviewed' | 'needs_expert_review' = 'in_review'

    await db.transaction(async (tx) => {
      // Lock serializado por epicrisis: dos submits (o un submit y un
      // closeExpertReview) sobre la MISMA epicrisis se ejecutan uno tras otro,
      // así el conteo de completados es exacto y el estado no queda atascado.
      await tx.execute(sql`SELECT pg_advisory_xact_lock(${epicrisisIdNum})`)

      // Anotaciones del usuario actual (delete + insert)
      await tx
        .delete(annotations)
        .where(and(
          eq(annotations.epicrisisId, epicrisisIdNum),
          eq(annotations.userId, userId),
        ))

      if (criteria.length > 0) {
        await tx.insert(annotations).values(
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

      // ── Bloquear la fila de la epicrisis ANTES de leer/contar ───────────────
      // FOR UPDATE serializa los submits concurrentes y el closeExpertReview del
      // admin: el 2º en entrar espera al 1º y ve su completedAt ya commiteado
      // (si no, ambos cuentan completed=1 y la epicrisis queda atascada en
      // in_review). También provee el status fresco para la lógica de experto.
      const [{ status: currentStatus }] = await tx
        .select({ status: epicrisis.status })
        .from(epicrisis)
        .where(eq(epicrisis.id, epicrisisIdNum))
        .limit(1)

      // ── Determinar nuevo status basado en todas las asignaciones ────────────
      // 'reviewed' solo cuando TODOS los asignados hicieron submit final.
      const allAssignments = await tx
        .select({ completedAt: epicrisisAssignments.completedAt })
        .from(epicrisisAssignments)
        .where(eq(epicrisisAssignments.epicrisisId, epicrisisIdNum))

      if (allAssignments.length === 0) {
        // Legado: epicrisis sin fila en epicrisis_assignments
        newStatus = isFinal ? 'reviewed' : 'in_review'
      } else {
        if (assignment) {
          await tx
            .update(epicrisisAssignments)
            .set({ completedAt: isFinal ? new Date() : null })
            .where(eq(epicrisisAssignments.id, assignment.id))
        }

        const [{ total, completed }] = await tx
          .select({
            total:     sql<number>`COUNT(*)`.mapWith(Number),
            completed: sql<number>`COUNT(CASE WHEN completed_at IS NOT NULL THEN 1 END)`.mapWith(Number),
          })
          .from(epicrisisAssignments)
          .where(eq(epicrisisAssignments.epicrisisId, epicrisisIdNum))

        newStatus = (completed === total && total > 0) ? 'reviewed' : 'in_review'
      }

      // ── HU-001: derivación a revisión experta ───────────────────────────────
      // ≥ N criterios "unknown" en submit final → needs_expert_review. Pegajoso:
      // una vez derivado solo un admin lo cierra. Umbral seguro (NaN/<1 → 3).
      const parsedThreshold = Number(process.env.EXPERT_REVIEW_UNKNOWN_THRESHOLD)
      const expertThreshold = Number.isFinite(parsedThreshold) && parsedThreshold >= 1 ? parsedThreshold : 3
      const unknownCount = isFinal
        ? criteria.filter((c: any) => c.isPresent === 'unknown').length
        : 0

      if ((isFinal && unknownCount >= expertThreshold) || currentStatus === 'needs_expert_review') {
        newStatus = 'needs_expert_review'
      }

      await tx
        .update(epicrisis)
        .set({ status: newStatus, lockedBy: null, lockedAt: null })
        .where(eq(epicrisis.id, epicrisisIdNum))

      // ── Datos clínicos per-user (fechas + comentario) ───────────────────────
      if (epicrisisMetadata) {
        const columns = getTableColumns(epicrisisClinicalData)
        const validKeys = new Set(Object.keys(columns))
        const filteredData: Record<string, any> = {}

        if (epicrisisMetadata.clinicalData) {
          for (const [key, val] of Object.entries(epicrisisMetadata.clinicalData as Record<string, any>)) {
            if (validKeys.has(key) && key !== 'epicrisisId' && key !== 'userId') {
              filteredData[key] = val
            }
          }
          const unknowns = (epicrisisMetadata.clinicalData as any)._unknowns
          filteredData.unknownFields = Array.isArray(unknowns) ? unknowns : []
        }

        if (epicrisisMetadata.fechaIngresoHosp !== undefined) filteredData.fechaIngresoHosp = epicrisisMetadata.fechaIngresoHosp ?? null
        if (epicrisisMetadata.fechaEgresoHosp  !== undefined) filteredData.fechaEgresoHosp  = epicrisisMetadata.fechaEgresoHosp  ?? null
        if (epicrisisMetadata.fechaIngresoUci  !== undefined) filteredData.fechaIngresoUci  = epicrisisMetadata.fechaIngresoUci  ?? null
        if (epicrisisMetadata.fechaEgresoUci   !== undefined) filteredData.fechaEgresoUci   = epicrisisMetadata.fechaEgresoUci   ?? null
        if (epicrisisMetadata.comentarioFinal  !== undefined) filteredData.comentarioFinal  = epicrisisMetadata.comentarioFinal  ?? null

        if (Object.keys(filteredData).length > 0) {
          await tx
            .insert(epicrisisClinicalData)
            .values({ epicrisisId: epicrisisIdNum, userId, ...filteredData })
            .onConflictDoUpdate({
              target: [epicrisisClinicalData.epicrisisId, epicrisisClinicalData.userId],
              set: filteredData,
            })
        }

        // ── Dificultad por sección clínica ────────────────────────────────────
        const clinicalDifficulty = epicrisisMetadata.clinicalDifficulty as
          | Record<string, { difficulty: string | null; notes: string }>
          | undefined

        if (clinicalDifficulty) {
          for (const [section, data] of Object.entries(clinicalDifficulty)) {
            await tx
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
    })

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

export default withErrors(handler)
