import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import path from 'path'
import type { VercelRequest, VercelResponse } from '@vercel/node'

// Importar los handlers existentes compatibles con el wrapper
import authHandler from '../api/auth.js'
import epicrisisHandler from '../api/epicrisis.js'
import annotationsHandler from '../api/annotations.js'
import adminHandler from '../api/admin.js'
import lockHandler from '../api/lock.js'

const app = express()

// Configurar CORS
const corsOrigin = process.env.CORS_ORIGIN || '*'
app.use(
  cors({
    origin: corsOrigin === '*' ? true : corsOrigin.split(','),
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'ngrok-skip-browser-warning'],
  })
)

app.use(express.json())

// Servir la carpeta local de uploads estáticos (PDFs)
const uploadsPath = path.join(process.cwd(), 'uploads')
app.use('/uploads', express.static(uploadsPath))

// Adaptar Express req/res al contrato VercelRequest/VercelResponse
type Handler = (req: VercelRequest, res: VercelResponse) => unknown

function wrap(handler: Handler) {
  return (req: express.Request, res: express.Response) =>
    handler(req as unknown as VercelRequest, res as unknown as VercelResponse)
}

// Endpoints
app.all('/api/auth', wrap(authHandler))
app.all('/api/epicrisis', wrap(epicrisisHandler))
app.all('/api/annotations', wrap(annotationsHandler))
app.all('/api/admin', wrap(adminHandler))
app.all('/api/lock', wrap(lockHandler))

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`🚀 Servidor API Express corriendo en → http://localhost:${PORT}`)
  console.log(`📁 Carpeta de PDFs estáticos expuesta en → http://localhost:${PORT}/uploads`)
})
