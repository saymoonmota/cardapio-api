import { Router, type Request, type Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import db from '../db'
import type { Admin } from '../types'

const router = Router()

// POST /api/auth/login
router.post('/login', (req: Request, res: Response): void => {
  const { email, senha } = req.body as { email?: string; senha?: string }

  if (!email || !senha) {
    res.status(400).json({ error: 'E-mail e senha são obrigatórios.' })
    return
  }

  const admin = db
    .prepare('SELECT * FROM admins WHERE email = ?')
    .get(email.trim().toLowerCase()) as Admin | undefined

  if (!admin) {
    res.status(401).json({ error: 'Credenciais inválidas.' })
    return
  }

  const senhaOk = bcrypt.compareSync(senha, admin.senha_hash)
  if (!senhaOk) {
    res.status(401).json({ error: 'Credenciais inválidas.' })
    return
  }

  const secret = process.env.JWT_SECRET!
  const token = jwt.sign(
    { adminId: admin.id, email: admin.email },
    secret,
    { expiresIn: '8h' }
  )

  res.json({
    token,
    admin: { id: admin.id, email: admin.email }
  })
})

// GET /api/auth/me  — verifica se o token ainda é válido
router.get('/me', (req: Request, res: Response): void => {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Não autenticado.' })
    return
  }

  try {
    const payload = jwt.verify(header.slice(7), process.env.JWT_SECRET!) as { adminId: number; email: string }
    res.json({ adminId: payload.adminId, email: payload.email })
  } catch {
    res.status(401).json({ error: 'Token inválido ou expirado.' })
  }
})

export default router
