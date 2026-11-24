import type { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import type { JwtPayload } from '../types'

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Token de autenticação ausente.' })
    return
  }

  const token = header.slice(7)
  const secret = process.env.JWT_SECRET

  if (!secret) {
    res.status(500).json({ error: 'Configuração de servidor incompleta.' })
    return
  }

  try {
    const payload = jwt.verify(token, secret) as JwtPayload
    req.admin = payload
    next()
  } catch {
    res.status(401).json({ error: 'Token inválido ou expirado.' })
  }
}
