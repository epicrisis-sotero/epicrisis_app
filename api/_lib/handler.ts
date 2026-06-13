import type { VercelRequest, VercelResponse } from '@vercel/node'

// Envuelve un handler para que cualquier error no controlado (p. ej. una
// violación de constraint en la DB) responda 500 en vez de propagarse y tumbar
// el proceso de la API.
export function withErrors(
  fn: (req: VercelRequest, res: VercelResponse) => Promise<unknown> | unknown,
) {
  return async (req: VercelRequest, res: VercelResponse) => {
    try {
      return await fn(req, res)
    } catch (err) {
      console.error('[API error]', req.method, req.url, err)
      if (!res.headersSent) {
        res.status(500).json({ error: 'Error interno del servidor' })
      }
    }
  }
}
