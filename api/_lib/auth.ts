import { SignJWT, jwtVerify } from 'jose'
import type { IncomingMessage } from 'http'

const secret = () => {
  if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is not defined in environment variables')
  return new TextEncoder().encode(process.env.JWT_SECRET)
}

export interface TokenPayload {
  sub: string
  email: string
  role: 'admin' | 'annotator'
}

export async function signToken(payload: TokenPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(await secret())
}

export async function verifyToken(token: string): Promise<TokenPayload> {
  const { payload } = await jwtVerify(token, await secret())
  return payload as unknown as TokenPayload
}

export function parseCookies(req: IncomingMessage): Record<string, string> {
  const cookieHeader = req.headers.cookie ?? ''
  return Object.fromEntries(
    cookieHeader.split(';').map((c) => {
      const [k, ...v] = c.trim().split('=')
      return [k, decodeURIComponent(v.join('='))]
    })
  )
}

export async function getAuthUser(req: IncomingMessage): Promise<TokenPayload | null> {
  try {
    let token = ''
    const authHeader = req.headers.authorization
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7)
    } else {
      const cookies = parseCookies(req)
      token = cookies['auth_token']
    }
    if (!token) return null
    return await verifyToken(token)
  } catch {
    return null
  }
}

export function setCookieHeader(token: string): string {
  const maxAge = 60 * 60 * 24 * 7
  return `auth_token=${token}; HttpOnly; Secure; SameSite=Strict; Max-Age=${maxAge}; Path=/`
}

export function clearCookieHeader(): string {
  return `auth_token=; HttpOnly; Secure; SameSite=Strict; Max-Age=0; Path=/`
}
