import 'dotenv/config'
import express from 'express'
import type { VercelRequest, VercelResponse } from '@vercel/node'

// Importa los mismos handlers que usa Vercel en producción
import authHandler from '../api/auth.js'
import epicrisisHandler from '../api/epicrisis.js'
import annotationsHandler from '../api/annotations.js'
import adminHandler from '../api/admin.js'
import lockHandler from '../api/lock.js'

const app = express()
app.use(express.json())

// Adapta Express req/res al contrato VercelRequest/VercelResponse
// Express extiende IncomingMessage/ServerResponse — misma base, compatible
type Handler = (req: VercelRequest, res: VercelResponse) => unknown

function wrap(handler: Handler) {
  return (req: express.Request, res: express.Response) =>
    handler(req as unknown as VercelRequest, res as unknown as VercelResponse)
}

app.all('/api/auth', wrap(authHandler))
app.all('/api/epicrisis', wrap(epicrisisHandler))
app.all('/api/annotations', wrap(annotationsHandler))
app.all('/api/admin', wrap(adminHandler))
app.all('/api/lock', wrap(lockHandler))

const PORT = 3001
app.listen(PORT, () => {
  console.log(`  API dev server → http://localhost:${PORT}/api`)
})
