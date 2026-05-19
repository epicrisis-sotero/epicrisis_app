import type { VercelRequest, VercelResponse } from '@vercel/node'
import { z } from 'zod'
import { eq, sql } from 'drizzle-orm'
import bcrypt from 'bcryptjs'
import { db, users, epicrisis, annotations } from './_lib/db.js'
import { getAuthUser } from './_lib/auth.js'
import { cors } from './_lib/cors.js'

const AssignSchema = z.object({
  epicrisisId: z.number().int().positive(),
  userId: z.number().int().positive().nullable(),
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
          assigneeEmail: users.email,
          annotatedCount: sql<number>`count(${annotations.isPresent})`.mapWith(Number),
        })
        .from(epicrisis)
        .leftJoin(users, eq(epicrisis.assigneeId, users.id))
        .leftJoin(annotations, eq(epicrisis.id, annotations.epicrisisId))
        .groupBy(epicrisis.id, users.email)
        .orderBy(epicrisis.id)

      const total = rows.length
      const byStatus = { pending: 0, in_review: 0, reviewed: 0 }
      const unassigned = rows.filter((r) => r.assigneeId === null).length
      rows.forEach((r) => byStatus[r.status]++)

      return res.status(200).json({
        epicrises: rows,
        stats: { total, unassigned, ...byStatus },
      })
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

    const { epicrisisId, userId } = parsed.data

    const [doc] = await db
      .select({ id: epicrisis.id, status: epicrisis.status })
      .from(epicrisis)
      .where(eq(epicrisis.id, epicrisisId))
      .limit(1)

    if (!doc) return res.status(404).json({ error: 'Epicrisis no encontrada' })
    if (doc.status === 'reviewed') {
      return res.status(409).json({ error: 'No se puede reasignar una epicrisis ya revisada' })
    }

    await db
      .update(epicrisis)
      .set({ assigneeId: userId })
      .where(eq(epicrisis.id, epicrisisId))

    return res.status(200).json({ ok: true })
  }

  return res.status(405).json({ error: 'Método no permitido' })
}
