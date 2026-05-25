import type { VercelRequest, VercelResponse } from '@vercel/node'
import { z } from 'zod'
import { eq, sql, and, inArray } from 'drizzle-orm'
import bcrypt from 'bcryptjs'
import { db, users, epicrisis, annotations, epicrisisAssignments } from './_lib/db.js'
import { getAuthUser } from './_lib/auth.js'
import { cors } from './_lib/cors.js'

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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  cors(req, res)
  if (req.method === 'OPTIONS') return res.status(204).end()

  const authUser = await getAuthUser(req)
  if (!authUser) return res.status(401).json({ error: 'No autenticado' })
  if (authUser.role !== 'admin') return res.status(403).json({ error: 'Solo administradores' })

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

    if (resource === 'matrix') {
      const rows = await db
        .select({
          id: epicrisis.id,
          patientId: epicrisis.patientId,
          status: epicrisis.status,
          assigneeEmail: users.email,
          llmPredictions: epicrisis.llmPredictions,
          annotations: sql<Record<string, { isPresent: boolean | null; evidenceText: string | null }>>`
            COALESCE(
              json_object_agg(
                ${annotations.criterionName},
                json_build_object(
                  'isPresent', ${annotations.isPresent},
                  'evidenceText', ${annotations.evidenceText}
                )
              ) FILTER (WHERE ${annotations.criterionName} IS NOT NULL),
              '{}'::json
            )
          `.as('annotations'),
        })
        .from(epicrisis)
        .leftJoin(users, eq(epicrisis.assigneeId, users.id))
        .leftJoin(
          annotations,
          sql`${epicrisis.id} = ${annotations.epicrisisId} AND (${epicrisis.assigneeId} = ${annotations.userId} OR ${epicrisis.assigneeId} IS NULL)`
        )
        .groupBy(epicrisis.id, users.email)
        .orderBy(epicrisis.id)

      return res.status(200).json({ matrix: rows })
    }

    if (resource === 'epicrisis' || !resource) {
      const rows = await db
        .select({
          id: epicrisis.id,
          patientId: epicrisis.patientId,
          status: epicrisis.status,
          assigneeId: epicrisis.assigneeId,
          createdAt: epicrisis.createdAt,
          annotatedCount: sql<number>`count(distinct ${annotations.id})`.mapWith(Number),
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
        .leftJoin(annotations, eq(epicrisis.id, annotations.epicrisisId))
        .groupBy(epicrisis.id)
        .orderBy(epicrisis.id)

      const total = rows.length
      const byStatus = { pending: 0, in_review: 0, reviewed: 0 }
      const unassigned = rows.filter((r) => (r.assignees as any[]).length === 0).length
      rows.forEach((r) => byStatus[r.status]++)

      return res.status(200).json({
        epicrises: rows,
        stats: { total, unassigned, ...byStatus },
      })
    }

    if (resource === 'irr') {
      // Cohen's κ por criterio para pares de anotadores con epicrisis solapadas
      const rows = await db
        .select({
          epicrisisId: annotations.epicrisisId,
          userId: annotations.userId,
          criterionName: annotations.criterionName,
          isPresent: annotations.isPresent,
        })
        .from(annotations)
        // Solo epicrisis con ≥2 anotadores distintos
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

      // Agrupar por epicrisis y criterio
      type AnnotationRow = { epicrisisId: number; userId: number; criterionName: string; isPresent: boolean | null }
      const data = rows as AnnotationRow[]

      // Obtener pares únicos de anotadores
      const byEpicrisis: Record<number, Record<string, Record<number, boolean | null>>> = {}
      for (const row of data) {
        if (!byEpicrisis[row.epicrisisId]) byEpicrisis[row.epicrisisId] = {}
        if (!byEpicrisis[row.epicrisisId][row.criterionName]) byEpicrisis[row.epicrisisId][row.criterionName] = {}
        byEpicrisis[row.epicrisisId][row.criterionName][row.userId] = row.isPresent
      }

      // Recopilar todos los criterios y pares
      const criterionMap: Record<string, { agreements: number; total: number; pa: number; pe: number }> = {}

      for (const epicId of Object.keys(byEpicrisis)) {
        const criteria = byEpicrisis[Number(epicId)]
        for (const criterion of Object.keys(criteria)) {
          const annotatorVotes = criteria[criterion]
          const userIds = Object.keys(annotatorVotes)
          if (userIds.length < 2) continue

          // Tomar primer par
          const [u1, u2] = userIds.map(Number)
          const v1 = annotatorVotes[u1]
          const v2 = annotatorVotes[u2]

          if (!criterionMap[criterion]) criterionMap[criterion] = { agreements: 0, total: 0, pa: 0, pe: 0 }
          criterionMap[criterion].total++
          if (v1 === v2) criterionMap[criterion].agreements++
        }
      }

      // Calcular κ por criterio
      const results = Object.entries(criterionMap).map(([criterion, { agreements, total }]) => {
        const po = total > 0 ? agreements / total : 0
        // Pe simple: asume distribución 50/50 para binary (conservador)
        const pe = 0.5
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

      // Limpieza manual de todas las referencias para evitar errores de FK
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
    if (doc.status === 'reviewed') {
      return res.status(409).json({ error: 'No se puede reasignar una epicrisis ya revisada' })
    }

    // Reemplazar todas las asignaciones de esta epicrisis
    await db.delete(epicrisisAssignments).where(eq(epicrisisAssignments.epicrisisId, epicrisisId))

    if (userIds.length > 0) {
      await db.insert(epicrisisAssignments).values(
        userIds.map((uid) => ({ epicrisisId, userId: uid }))
      )
    }

    // Mantener assigneeId = primer asignado (para status tracking y matrix legacy)
    await db
      .update(epicrisis)
      .set({ assigneeId: userIds.length > 0 ? userIds[0] : null })
      .where(eq(epicrisis.id, epicrisisId))

    return res.status(200).json({ ok: true })
  }

  return res.status(405).json({ error: 'Método no permitido' })
}
