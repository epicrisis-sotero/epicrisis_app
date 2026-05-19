import type { VercelRequest, VercelResponse } from '@vercel/node'

export function cors(req: VercelRequest, res: VercelResponse) {
  const origin = req.headers.origin
  const allowed = process.env.CORS_ORIGIN || '*'
  
  if (allowed === '*') {
    res.setHeader('Access-Control-Allow-Origin', '*')
  } else if (origin && allowed.split(',').map(o => o.trim()).includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin)
  }
  
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, ngrok-skip-browser-warning')
}
