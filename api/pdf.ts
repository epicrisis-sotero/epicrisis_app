import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Missing PDF ID' })
  }

  const backendBase = process.env.BACKEND_URL || 'https://epicrisis.2.24.69.49.nip.io'
  const backendUrl = `${backendBase}/uploads/${id}`

  try {
    const response = await fetch(backendUrl)

    if (!response.ok) {
      return res.status(response.status).json({ error: `Backend returned ${response.statusText}` })
    }

    const arrayBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Content-Disposition', `inline; filename="${id}"`)
    
    return res.status(200).send(buffer)
  } catch (error: any) {
    console.error('Proxy error:', error)
    return res.status(500).json({ error: error.message || 'Internal Server Error' })
  }
}
