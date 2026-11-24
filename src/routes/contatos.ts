import { Router, type Request, type Response } from 'express'
import db from '../db'
import { requireAuth } from '../middleware/auth'
import type { ContatoRow, Contato } from '../types'

const router = Router()

function rowToContato(row: ContatoRow): Contato {
  return {
    id: row.id,
    nome: row.nome,
    email: row.email,
    mensagem: row.mensagem,
    lido: row.lido === 1,
    criadoEm: row.criado_em,
  }
}

// ─── Rota pública ────────────────────────────────────────────────────────────

// POST /api/contatos — recebe sugestão do formulário do frontend
router.post('/', (req: Request, res: Response): void => {
  const { nome, email, mensagem } = req.body as { nome?: string; email?: string; mensagem?: string }

  if (!nome?.trim() || !email?.trim() || !mensagem?.trim()) {
    res.status(400).json({ error: 'Nome, e-mail e mensagem são obrigatórios.' })
    return
  }

  if (nome.trim().length < 2) {
    res.status(400).json({ error: 'O nome deve ter pelo menos 2 caracteres.' })
    return
  }

  if (mensagem.trim().length < 10) {
    res.status(400).json({ error: 'A mensagem deve ter pelo menos 10 caracteres.' })
    return
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email.trim())) {
    res.status(400).json({ error: 'E-mail inválido.' })
    return
  }

  const result = db.prepare(`
    INSERT INTO contatos (nome, email, mensagem)
    VALUES (?, ?, ?)
  `).run(nome.trim(), email.trim().toLowerCase(), mensagem.trim())

  const created = db
    .prepare('SELECT * FROM contatos WHERE id = ?')
    .get(result.lastInsertRowid) as ContatoRow

  res.status(201).json(rowToContato(created))
})

// ─── Rotas de administração ──────────────────────────────────────────────────

// GET /api/contatos — lista todos os contatos (paginado)
router.get('/', requireAuth, (req: Request, res: Response): void => {
  const page = Math.max(1, parseInt(String(req.query.page ?? '1'), 10))
  const limit = Math.min(50, Math.max(1, parseInt(String(req.query.limit ?? '20'), 10)))
  const offset = (page - 1) * limit
  const apenasNaoLidos = req.query.naoLidos === 'true'

  const where = apenasNaoLidos ? 'WHERE lido = 0' : ''

  const total = (db.prepare(`SELECT COUNT(*) as total FROM contatos ${where}`).get() as { total: number }).total
  const rows = db
    .prepare(`SELECT * FROM contatos ${where} ORDER BY criado_em DESC LIMIT ? OFFSET ?`)
    .all(limit, offset) as ContatoRow[]

  res.json({
    data: rows.map(rowToContato),
    paginacao: {
      total,
      pagina: page,
      limite: limit,
      totalPaginas: Math.ceil(total / limit),
    },
  })
})

// GET /api/contatos/:id — detalhe de um contato
router.get('/:id', requireAuth, (req: Request, res: Response): void => {
  const row = db
    .prepare('SELECT * FROM contatos WHERE id = ?')
    .get(req.params.id) as ContatoRow | undefined

  if (!row) {
    res.status(404).json({ error: 'Contato não encontrado.' })
    return
  }

  // Marca como lido automaticamente ao abrir
  if (row.lido === 0) {
    db.prepare('UPDATE contatos SET lido = 1 WHERE id = ?').run(row.id)
    row.lido = 1
  }

  res.json(rowToContato(row))
})

// PATCH /api/contatos/:id/lido — marca/desmarca como lido
router.patch('/:id/lido', requireAuth, (req: Request, res: Response): void => {
  const row = db
    .prepare('SELECT lido FROM contatos WHERE id = ?')
    .get(req.params.id) as { lido: number } | undefined

  if (!row) {
    res.status(404).json({ error: 'Contato não encontrado.' })
    return
  }

  const { lido } = req.body as { lido?: boolean }
  const novoLido = typeof lido === 'boolean' ? (lido ? 1 : 0) : (row.lido === 1 ? 0 : 1)

  db.prepare('UPDATE contatos SET lido = ? WHERE id = ?').run(novoLido, req.params.id)
  res.json({ id: parseInt(req.params.id), lido: novoLido === 1 })
})

// DELETE /api/contatos/:id — remove um contato
router.delete('/:id', requireAuth, (req: Request, res: Response): void => {
  const result = db
    .prepare('DELETE FROM contatos WHERE id = ?')
    .run(req.params.id)

  if (result.changes === 0) {
    res.status(404).json({ error: 'Contato não encontrado.' })
    return
  }

  res.json({ message: 'Contato removido.' })
})

export default router
