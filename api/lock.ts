import type { VercelRequest, VercelResponse } from '@vercel/node'
import { eq } from 'drizzle-orm'
import { db, epicrisis, users } from './_lib/db.js'
import { getAuthUser } from './_lib/auth.js'
import { cors } from './_lib/cors.js'

const LOCK_TIMEOUT_MINUTES = 5

export default async function handler(req: VercelRequest, res: VercelResponse) {
  cors(req, res)
  if (req.method === 'OPTIONS') return res.status(204).end()

  const authUser = await getAuthUser(req)
  if (!authUser) return res.status(401).json({ error: 'No autenticado' })

  const userId = Number(authUser.sub)
  const { epicrisisId, action } = req.body

  if (!epicrisisId) return res.status(400).json({ error: 'epicrisisId requerido' })

  if (action === 'lock') {
    // Intentar adquirir lock
    // Un lock es válido si:
    // 1. No hay lock (lockedBy is null)
    // 2. El lock es mío
    // 3. El lock expiró (más de 5 min)
    const timeoutDate = new Date(Date.now() - LOCK_TIMEOUT_MINUTES * 60000)

    const [doc] = await db
      .select({
        lockedBy: epicrisis.lockedBy,
        lockedAt: epicrisis.lockedAt,
        lockedByEmail: users.email
      })
      .from(epicrisis)
      .leftJoin(users, eq(epicrisis.lockedBy, users.id))
      .where(eq(epicrisis.id, Number(epicrisisId)))
      .limit(1)

    if (doc && doc.lockedBy && doc.lockedBy !== userId && doc.lockedAt && doc.lockedAt > timeoutDate) {
      return res.status(423).json({ 
        error: 'Documento bloqueado', 
        lockedBy: doc.lockedByEmail || 'Otro usuario' 
      })
    }

    // Adquirir o renovar lock
    await db
      .update(epicrisis)
      .set({ 
        lockedBy: userId, 
        lockedAt: new Date() 
      })
      .where(eq(epicrisis.id, Number(epicrisisId)))

    return res.status(200).json({ ok: true })
  }

  if (action === 'unlock') {
    // Liberar lock solo si soy el dueño o soy admin
    const [doc] = await db
      .select({ lockedBy: epicrisis.lockedBy })
      .from(epicrisis)
      .where(eq(epicrisis.id, Number(epicrisisId)))
      .limit(1)

    if (doc?.lockedBy === userId || authUser.role === 'admin') {
      await db
        .update(epicrisis)
        .set({ lockedBy: null, lockedAt: null })
        .where(eq(epicrisis.id, Number(epicrisisId)))
    }
    return res.status(200).json({ ok: true })
  }

  return res.status(400).json({ error: 'Acción inválida' })
}
