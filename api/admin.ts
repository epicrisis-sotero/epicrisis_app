import type { VercelRequest, VercelResponse } from '@vercel/node'
import { z } from 'zod'
import { eq, sql, and, inArray } from 'drizzle-orm'
import bcrypt from 'bcryptjs'
import { db, users, epicrisis, annotations, epicrisisAssignments } from './_lib/db.js'
import { getAuthUser } from './_lib/auth.js'
import { cors } from './_lib/cors.js'
import { withErrors } from './_lib/handler.js'

const AssignSchema = z.object({
  epicrisisId: z.number().int().positive(),
  userIds: z.array(z.number().int().positive()),
})

const CreateUserSchema = z.object({
  action: z.literal('createUser'),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(['admin', 'annotator']),
})

const UpdateRoleSchema = z.object({
  action: z.literal('updateRole'),
  userId: z.number().int().positive(),
  role: z.enum(['admin', 'annotator']),
})

const DeleteUserSchema = z.object({
  action: z.literal('deleteUser'),
  userId: z.number().int().positive(),
})

const ResetPasswordSchema = z.object({
  action: z.literal('resetPassword'),
  userId: z.number().int().positive(),
  newPassword: z.string().min(8),
})

const CloseExpertReviewSchema = z.object({
  action: z.literal('closeExpertReview'),
  epicrisisId: z.number().int().positive(),
})

async function handler(req: VercelRequest, res: VercelResponse) {
  cors(req, res)
  if (req.method === 'OPTIONS') return res.status(204).end()

  const authUser = await getAuthUser(req)
  if (!authUser) return res.status(401).json({ error: 'No autenticado' })

  // Verificar rol directamente en DB — el JWT puede estar desactualizado si el rol cambió
  const [freshUser] = await db
    .select({ role: users.role })
    .from(users)
    .where(eq(users.id, Number(authUser.sub)))
    .limit(1)

  if (!freshUser || freshUser.role !== 'admin') {
    return res.status(403).json({ error: 'Solo administradores' })
  }

  // ── GET ──────────────────────────────────────────────────────────────────────
  if (req.method === 'GET') {
    const resource = req.query.resource as string

    if (resource === 'users') {
      const rows = await db
        .select({ id: users.id, email: users.email, role: users.role, createdAt: users.createdAt, termsAcceptedAt: users.termsAcceptedAt })
        .from(users)
        .where(eq(users.role, 'annotator'))
      return res.status(200).json({ users: rows })
    }

    if (resource === 'allUsers') {
      const rows = await db
        .select({ id: users.id, email: users.email, role: users.role, createdAt: users.createdAt, termsAcceptedAt: users.termsAcceptedAt })
        .from(users)
        .orderBy(users.createdAt)
      return res.status(200).json({ users: rows })
    }

    // ── Matrix — todos los anotadores por epicrisis, no solo el primario ───────
    if (resource === 'matrix') {
      // Query 1: metadatos de cada epicrisis
      const epicrisisRows = await db
        .select({
          id: epicrisis.id,
          patientId: epicrisis.patientId,
          status: epicrisis.status,
          assigneeEmail: users.email,
          llmPredictions: epicrisis.llmPredictions,
        })
        .from(epicrisis)
        .leftJoin(users, eq(epicrisis.assigneeId, users.id))
        .orderBy(epicrisis.id)

      // Query 2: TODAS las anotaciones con email del anotador
      const annotationRows = await db
        .select({
          epicrisisId: annotations.epicrisisId,
          userId:      annotations.userId,
          userEmail:   users.email,
          criterionName: annotations.criterionName,
          isPresent:   annotations.isPresent,
          isUnknown:   annotations.isUnknown,
          evidenceText: annotations.evidenceText,
          difficulty:  annotations.difficulty,
        })
        .from(annotations)
        .leftJoin(users, eq(annotations.userId, users.id))

      // Merge en JS: Record<epicrisisId, Record<criterionName, AnnotatorEntry[]>>
      type AnnotatorEntry = {
        userId: number
        email: string | null
        isPresent: boolean | null
        isUnknown: boolean
        evidenceText: string | null
        difficulty: string | null
      }
      const byEpic: Record<number, Record<string, AnnotatorEntry[]>> = {}

      for (const row of annotationRows) {
        if (!byEpic[row.epicrisisId]) byEpic[row.epicrisisId] = {}
        const crit = byEpic[row.epicrisisId]
        if (!crit[row.criterionName]) crit[row.criterionName] = []
        crit[row.criterionName].push({
          userId:      row.userId,
          email:       row.userEmail,
          isPresent:   row.isPresent,
          isUnknown:   row.isUnknown ?? false,
          evidenceText: row.evidenceText,
          difficulty:  row.difficulty,
        })
      }

      const matrix = epicrisisRows.map(row => ({
        ...row,
        annotations: byEpic[row.id] ?? {},
      }))

      return res.status(200).json({ matrix })
    }

    if (resource === 'epicrisis' || !resource) {
      // Query 1: epicrisis con asignados (sin contar anotaciones)
      const rows = await db
        .select({
          id: epicrisis.id,
          patientId: epicrisis.patientId,
          status: epicrisis.status,
          assigneeId: epicrisis.assigneeId,
          createdAt: epicrisis.createdAt,
          assignees: sql<{ id: number; email: string }[]>`
            COALESCE(
              json_agg(
                DISTINCT jsonb_build_object('id', ${epicrisisAssignments.userId}, 'email', ${users.email})
              ) FILTER (WHERE ${epicrisisAssignments.userId} IS NOT NULL),
              '[]'::json
            )
          `.as('assignees'),
        })
        .from(epicrisis)
        .leftJoin(epicrisisAssignments, eq(epicrisis.id, epicrisisAssignments.epicrisisId))
        .leftJoin(users, eq(epicrisisAssignments.userId, users.id))
        .groupBy(epicrisis.id)
        .orderBy(epicrisis.id)

      // Query 2: conteo de anotaciones por (epicrisis, usuario) — evita mezclar anotadores
      const annotCounts = await db
        .select({
          epicrisisId: annotations.epicrisisId,
          userId:      annotations.userId,
          cnt:         sql<number>`count(*)`.mapWith(Number),
        })
        .from(annotations)
        .groupBy(annotations.epicrisisId, annotations.userId)

      // Lookup: epicrisisId → userId → count
      const countMap: Record<number, Record<number, number>> = {}
      for (const ac of annotCounts) {
        if (!countMap[ac.epicrisisId]) countMap[ac.epicrisisId] = {}
        countMap[ac.epicrisisId][ac.userId] = ac.cnt
      }

      // Enriquecer asignados con su conteo individual
      const epicrises = rows.map(row => ({
        ...row,
        assignees: (row.assignees as { id: number; email: string }[]).map(a => ({
          ...a,
          annotatedCount: countMap[row.id]?.[a.id] ?? 0,
        })),
      }))

      const total = epicrises.length
      const byStatus = { pending: 0, in_review: 0, reviewed: 0, needs_expert_review: 0 }
      const unassigned = epicrises.filter((r) => r.assignees.length === 0).length
      epicrises.forEach((r) => { if (r.status in byStatus) byStatus[r.status]++ })

      return res.status(200).json({
        epicrises,
        stats: { total, unassigned, ...byStatus },
      })
    }

    // ── IRR — Cohen's κ por criterio con fórmula correcta ───────────────────
    if (resource === 'irr') {
      const rows = await db
        .select({
          epicrisisId:   annotations.epicrisisId,
          userId:        annotations.userId,
          criterionName: annotations.criterionName,
          isPresent:     annotations.isPresent,
          isUnknown:     annotations.isUnknown,
        })
        .from(annotations)
        .where(
          inArray(
            annotations.epicrisisId,
            db
              .select({ epicrisisId: annotations.epicrisisId })
              .from(annotations)
              .groupBy(annotations.epicrisisId)
              .having(sql`count(distinct ${annotations.userId}) >= 2`),
          )
        )

      // Estructura: epicrisisId → criterionName → userId → { isPresent, isUnknown }
      type VoteData = { isPresent: boolean | null; isUnknown: boolean }
      const byEpicrisis: Record<number, Record<string, Record<number, VoteData>>> = {}

      for (const row of rows) {
        if (!byEpicrisis[row.epicrisisId]) byEpicrisis[row.epicrisisId] = {}
        if (!byEpicrisis[row.epicrisisId][row.criterionName]) byEpicrisis[row.epicrisisId][row.criterionName] = {}
        byEpicrisis[row.epicrisisId][row.criterionName][row.userId] = {
          isPresent: row.isPresent,
          isUnknown: row.isUnknown ?? false,
        }
      }

      // Acumular pares de votos por criterio (todos los pares, no solo el primero)
      type VotePair = [boolean | null, boolean | null]
      const pairsByCriterion: Record<string, VotePair[]> = {}

      for (const epicId of Object.keys(byEpicrisis)) {
        const criteriaData = byEpicrisis[Number(epicId)]
        for (const criterion of Object.keys(criteriaData)) {
          const votes = criteriaData[criterion]
          const userIds = Object.keys(votes).map(Number)
          if (userIds.length < 2) continue

          // Generar todos los pares posibles entre anotadores
          for (let i = 0; i < userIds.length; i++) {
            for (let j = i + 1; j < userIds.length; j++) {
              const v1 = votes[userIds[i]]
              const v2 = votes[userIds[j]]
              // Excluir pares donde alguno dijo "No sé" (no se puede forzar acuerdo/desacuerdo)
              if (v1.isUnknown || v2.isUnknown) continue

              if (!pairsByCriterion[criterion]) pairsByCriterion[criterion] = []
              pairsByCriterion[criterion].push([v1.isPresent, v2.isPresent])
            }
          }
        }
      }

      // Cohen's κ con frecuencias marginales reales (Pe correcto, no 0.5 fijo)
      const results = Object.entries(pairsByCriterion).map(([criterion, pairs]) => {
        const total = pairs.length
        const agreements = pairs.filter(([v1, v2]) => v1 === v2).length
        const po = total > 0 ? agreements / total : 0

        // Frecuencias marginales de cada anotador para Pe
        const r1_yes = pairs.filter(([v1]) => v1 === true).length / total
        const r2_yes = pairs.filter(([, v2]) => v2 === true).length / total
        const pe = r1_yes * r2_yes + (1 - r1_yes) * (1 - r2_yes)

        // κ = (Po - Pe) / (1 - Pe); Pe = 1 solo si todos votan igual (kappa indeterm.)
        const kappa = pe < 1 ? (po - pe) / (1 - pe) : 1

        return {
          criterion,
          total,
          agreements,
          agreementPct: Math.round(po * 100),
          kappa: Math.round(kappa * 100) / 100,
        }
      }).sort((a, b) => a.kappa - b.kappa)

      const nOverlapped = Object.keys(byEpicrisis).length
      const avgKappa = results.length > 0
        ? Math.round((results.reduce((s, r) => s + r.kappa, 0) / results.length) * 100) / 100
        : null

      return res.status(200).json({ results, nOverlapped, avgKappa })
    }

    return res.status(400).json({ error: 'resource inválido' })
  }

  // ── POST — gestión de usuarios ───────────────────────────────────────────────
  if (req.method === 'POST') {
    const body = req.body as { action?: unknown }

    if (body.action === 'createUser') {
      const parsed = CreateUserSchema.safeParse(req.body)
      if (!parsed.success) {
        return res.status(400).json({ error: 'Datos inválidos', details: parsed.error.flatten() })
      }
      const { email, password, role } = parsed.data

      const [existing] = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, email))
        .limit(1)
      if (existing) {
        return res.status(409).json({ error: 'Ya existe un usuario con ese email' })
      }

      const passwordHash = await bcrypt.hash(password, 10)
      const [created] = await db
        .insert(users)
        .values({ email, passwordHash, role })
        .returning({ id: users.id, email: users.email, role: users.role, createdAt: users.createdAt })

      return res.status(201).json({ ok: true, user: created })
    }

    if (body.action === 'updateRole') {
      const parsed = UpdateRoleSchema.safeParse(req.body)
      if (!parsed.success) {
        return res.status(400).json({ error: 'Datos inválidos', details: parsed.error.flatten() })
      }
      const { userId, role } = parsed.data

      if (userId === Number(authUser.sub)) {
        return res.status(403).json({ error: 'No puedes cambiar tu propio rol' })
      }

      await db.update(users).set({ role }).where(eq(users.id, userId))
      return res.status(200).json({ ok: true })
    }

    if (body.action === 'deleteUser') {
      const parsed = DeleteUserSchema.safeParse(req.body)
      if (!parsed.success) {
        return res.status(400).json({ error: 'Datos inválidos', details: parsed.error.flatten() })
      }
      const { userId } = parsed.data

      if (userId === Number(authUser.sub)) {
        return res.status(403).json({ error: 'No puedes eliminar tu propia cuenta' })
      }

      // Limpieza en orden inverso de FKs; annotation_clinical_difficulty
      // cascadea automáticamente al borrar el user, pero las demás referencias explícitas
      await db.delete(annotations).where(eq(annotations.userId, userId))
      await db.delete(epicrisisAssignments).where(eq(epicrisisAssignments.userId, userId))
      await db.update(epicrisis)
        .set({ assigneeId: null })
        .where(eq(epicrisis.assigneeId, userId))
      await db.update(epicrisis)
        .set({ lockedBy: null })
        .where(eq(epicrisis.lockedBy, userId))

      await db.delete(users).where(eq(users.id, userId))
      return res.status(200).json({ ok: true })
    }

    if (body.action === 'resetPassword') {
      const parsed = ResetPasswordSchema.safeParse(req.body)
      if (!parsed.success) {
        return res.status(400).json({ error: 'Datos inválidos', details: parsed.error.flatten() })
      }
      const { userId, newPassword } = parsed.data
      const passwordHash = await bcrypt.hash(newPassword, 10)
      await db.update(users).set({ passwordHash }).where(eq(users.id, userId))
      return res.status(200).json({ ok: true })
    }

    // ── HU-001: cerrar revisión experta → estado final 'reviewed' ────────────
    if (body.action === 'closeExpertReview') {
      const parsed = CloseExpertReviewSchema.safeParse(req.body)
      if (!parsed.success) {
        return res.status(400).json({ error: 'Datos inválidos', details: parsed.error.flatten() })
      }
      const { epicrisisId } = parsed.data

      const [doc] = await db
        .select({ id: epicrisis.id, status: epicrisis.status })
        .from(epicrisis)
        .where(eq(epicrisis.id, epicrisisId))
        .limit(1)
      if (!doc) return res.status(404).json({ error: 'Epicrisis no encontrada' })
      if (doc.status !== 'needs_expert_review') {
        return res.status(409).json({ error: 'La epicrisis no está en revisión experta' })
      }

      await db.update(epicrisis).set({ status: 'reviewed' }).where(eq(epicrisis.id, epicrisisId))
      return res.status(200).json({ ok: true, status: 'reviewed' })
    }

    return res.status(400).json({ error: 'Acción no reconocida' })
  }

  // ── PATCH — asignar/desasignar epicrisis ─────────────────────────────────────
  if (req.method === 'PATCH') {
    const parsed = AssignSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({ error: 'Payload inválido', details: parsed.error.flatten() })
    }

    const { epicrisisId, userIds } = parsed.data

    const [doc] = await db
      .select({ id: epicrisis.id, status: epicrisis.status })
      .from(epicrisis)
      .where(eq(epicrisis.id, epicrisisId))
      .limit(1)

    if (!doc) return res.status(404).json({ error: 'Epicrisis no encontrada' })

    // Preservar completedAt de quienes ya enviaron
    const existing = await db
      .select({ userId: epicrisisAssignments.userId, completedAt: epicrisisAssignments.completedAt })
      .from(epicrisisAssignments)
      .where(eq(epicrisisAssignments.epicrisisId, epicrisisId))

    const completedMap = new Map(existing.map(r => [r.userId, r.completedAt]))

    await db.delete(epicrisisAssignments).where(eq(epicrisisAssignments.epicrisisId, epicrisisId))

    if (userIds.length > 0) {
      await db.insert(epicrisisAssignments).values(
        userIds.map(uid => ({
          epicrisisId,
          userId: uid,
          completedAt: completedMap.get(uid) ?? null,
        }))
      )
    }

    // Recalcular status según quiénes quedan asignados y cuántos completaron.
    // La derivación a revisión experta es "pegajosa": persiste a través de
    // reasignaciones y solo se limpia con la acción closeExpertReview.
    let newStatus: 'pending' | 'in_review' | 'reviewed' | 'needs_expert_review'
    if (doc.status === 'needs_expert_review') {
      newStatus = 'needs_expert_review'
    } else if (userIds.length === 0) {
      newStatus = 'pending'
    } else {
      const completedCount = userIds.filter(uid => completedMap.get(uid) != null).length
      if (completedCount === userIds.length) {
        newStatus = 'reviewed'
      } else if (completedCount > 0) {
        newStatus = 'in_review'
      } else {
        newStatus = 'pending'
      }
    }

    await db
      .update(epicrisis)
      .set({ assigneeId: userIds.length > 0 ? userIds[0] : null, status: newStatus })
      .where(eq(epicrisis.id, epicrisisId))

    return res.status(200).json({ ok: true, status: newStatus })
  }

  return res.status(405).json({ error: 'Método no permitido' })
}

export default withErrors(handler)
