import type { VercelRequest, VercelResponse } from '@vercel/node'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { eq } from 'drizzle-orm'
import { db, users } from './_lib/db.js'
import { signToken, setCookieHeader, clearCookieHeader, getAuthUser } from './_lib/auth.js'
import { cors } from './_lib/cors.js'

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    cors(req, res)
    if (req.method === 'OPTIONS') return res.status(204).end()

    if (req.method === 'POST') {
      const parsed = LoginSchema.safeParse(req.body)
      if (!parsed.success) {
        return res.status(400).json({ error: 'Datos inválidos', details: parsed.error.flatten() })
      }

      const { email, password } = parsed.data

      const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1)
      if (!user) {
        return res.status(401).json({ error: 'Credenciales incorrectas' })
      }

      const valid = await bcrypt.compare(password, user.passwordHash)
      if (!valid) {
        return res.status(401).json({ error: 'Credenciales incorrectas' })
      }

      const token = await signToken({ sub: String(user.id), email: user.email, role: user.role })
      res.setHeader('Set-Cookie', setCookieHeader(token))
      return res.status(200).json({
        user: { id: user.id, email: user.email, role: user.role, termsAcceptedAt: user.termsAcceptedAt },
        token
      })
    }

    if (req.method === 'DELETE') {
      res.setHeader('Set-Cookie', clearCookieHeader())
      return res.status(200).json({ ok: true })
    }

    if (req.method === 'GET') {
      const authUser = await getAuthUser(req)
      if (!authUser) return res.status(401).json({ error: 'No autenticado' })

      const [user] = await db
        .select({ id: users.id, email: users.email, role: users.role, termsAcceptedAt: users.termsAcceptedAt })
        .from(users)
        .where(eq(users.id, Number(authUser.sub)))
        .limit(1)

      if (!user) return res.status(401).json({ error: 'Usuario no encontrado' })
      return res.status(200).json({ user })
    }

    if (req.method === 'PATCH') {
      const authUser = await getAuthUser(req)
      if (!authUser) return res.status(401).json({ error: 'No autenticado' })

      const [user] = await db
        .update(users)
        .set({ termsAcceptedAt: new Date() })
        .where(eq(users.id, Number(authUser.sub)))
        .returning({ id: users.id, email: users.email, role: users.role, termsAcceptedAt: users.termsAcceptedAt })

      return res.status(200).json({ user })
    }

    return res.status(405).json({ error: 'Método no permitido' })
  } catch (error) {
    console.error('[AUTH_ERROR]:', error)
    return res.status(500).json({ 
      error: 'Error interno del servidor', 
      message: error instanceof Error ? error.message : String(error) 
    })
  }
}
