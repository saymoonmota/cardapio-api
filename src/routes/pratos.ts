import { Router, type Request, type Response } from 'express'
import db from '../db'
import { requireAuth } from '../middleware/auth'
import type { PratoRow, Prato } from '../types'

const router = Router()

// ─── Utilitários ────────────────────────────────────────────────────────────

function rowToPrato(row: PratoRow): Prato {
  return {
    id: row.id,
    nome: row.nome,
    categoria: row.categoria as Prato['categoria'],
    tempoPreparoMinutos: row.tempo_preparo_minutos,
    descricao: row.descricao,
    imagem: row.imagem,
    imagemAlt: row.imagem_alt,
    avisoImagem: row.aviso_imagem,
    creditoImagem: row.credito_imagem,
    fonteImagem: row.fonte_imagem ?? undefined,
    ingredientes: JSON.parse(row.ingredientes),
    modoPreparo: row.modo_preparo,
    acompanhamentos: JSON.parse(row.acompanhamentos),
    ativo: row.ativo === 1,
    criadoEm: row.criado_em,
    atualizadoEm: row.atualizado_em,
  }
}

// ─── Rotas públicas ──────────────────────────────────────────────────────────

// GET /api/pratos — lista pratos ativos (usado pelo frontend)
router.get('/', (_req: Request, res: Response): void => {
  const rows = db
    .prepare('SELECT * FROM pratos WHERE ativo = 1 ORDER BY criado_em ASC')
    .all() as PratoRow[]

  res.json(rows.map(rowToPrato))
})

// GET /api/pratos/:id — detalhe público de um prato
router.get('/:id', (req: Request, res: Response): void => {
  const row = db
    .prepare('SELECT * FROM pratos WHERE id = ? AND ativo = 1')
    .get(req.params.id) as PratoRow | undefined

  if (!row) {
    res.status(404).json({ error: 'Prato não encontrado.' })
    return
  }

  res.json(rowToPrato(row))
})

// ─── Rotas de administração (requerem token) ─────────────────────────────────

// GET /api/pratos/admin/todos — lista todos os pratos (inclusive inativos)
router.get('/admin/todos', requireAuth, (_req: Request, res: Response): void => {
  const rows = db
    .prepare('SELECT * FROM pratos ORDER BY criado_em DESC')
    .all() as PratoRow[]

  res.json(rows.map(rowToPrato))
})

// POST /api/pratos — cria novo prato
router.post('/', requireAuth, (req: Request, res: Response): void => {
  const body = req.body as Partial<Prato>

  if (!body.id || !body.nome || !body.categoria) {
    res.status(400).json({ error: 'Os campos id, nome e categoria são obrigatórios.' })
    return
  }

  const existing = db.prepare('SELECT id FROM pratos WHERE id = ?').get(body.id)
  if (existing) {
    res.status(409).json({ error: `Já existe um prato com o id "${body.id}".` })
    return
  }

  db.prepare(`
    INSERT INTO pratos (
      id, nome, categoria, tempo_preparo_minutos,
      descricao, imagem, imagem_alt, aviso_imagem,
      credito_imagem, fonte_imagem, ingredientes,
      modo_preparo, acompanhamentos, ativo
    ) VALUES (
      @id, @nome, @categoria, @tempoPreparoMinutos,
      @descricao, @imagem, @imagemAlt, @avisoImagem,
      @creditoImagem, @fonteImagem, @ingredientes,
      @modoPreparo, @acompanhamentos, @ativo
    )
  `).run({
    id: body.id,
    nome: body.nome,
    categoria: body.categoria,
    tempoPreparoMinutos: body.tempoPreparoMinutos ?? 0,
    descricao: body.descricao ?? '',
    imagem: body.imagem ?? '',
    imagemAlt: body.imagemAlt ?? '',
    avisoImagem: body.avisoImagem ?? '',
    creditoImagem: body.creditoImagem ?? '',
    fonteImagem: body.fonteImagem ?? null,
    ingredientes: JSON.stringify(body.ingredientes ?? []),
    modoPreparo: body.modoPreparo ?? '',
    acompanhamentos: JSON.stringify(body.acompanhamentos ?? []),
    ativo: body.ativo === false ? 0 : 1,
  })

  const created = db.prepare('SELECT * FROM pratos WHERE id = ?').get(body.id) as PratoRow
  res.status(201).json(rowToPrato(created))
})

// PUT /api/pratos/:id — atualiza prato existente
router.put('/:id', requireAuth, (req: Request, res: Response): void => {
  const existing = db
    .prepare('SELECT * FROM pratos WHERE id = ?')
    .get(req.params.id) as PratoRow | undefined

  if (!existing) {
    res.status(404).json({ error: 'Prato não encontrado.' })
    return
  }

  const body = req.body as Partial<Prato>

  db.prepare(`
    UPDATE pratos SET
      nome                  = @nome,
      categoria             = @categoria,
      tempo_preparo_minutos = @tempoPreparoMinutos,
      descricao             = @descricao,
      imagem                = @imagem,
      imagem_alt            = @imagemAlt,
      aviso_imagem          = @avisoImagem,
      credito_imagem        = @creditoImagem,
      fonte_imagem          = @fonteImagem,
      ingredientes          = @ingredientes,
      modo_preparo          = @modoPreparo,
      acompanhamentos       = @acompanhamentos,
      ativo                 = @ativo,
      atualizado_em         = datetime('now')
    WHERE id = @id
  `).run({
    id: req.params.id,
    nome: body.nome ?? existing.nome,
    categoria: body.categoria ?? existing.categoria,
    tempoPreparoMinutos: body.tempoPreparoMinutos ?? existing.tempo_preparo_minutos,
    descricao: body.descricao ?? existing.descricao,
    imagem: body.imagem ?? existing.imagem,
    imagemAlt: body.imagemAlt ?? existing.imagem_alt,
    avisoImagem: body.avisoImagem ?? existing.aviso_imagem,
    creditoImagem: body.creditoImagem ?? existing.credito_imagem,
    fonteImagem: body.fonteImagem ?? existing.fonte_imagem,
    ingredientes: body.ingredientes ? JSON.stringify(body.ingredientes) : existing.ingredientes,
    modoPreparo: body.modoPreparo ?? existing.modo_preparo,
    acompanhamentos: body.acompanhamentos ? JSON.stringify(body.acompanhamentos) : existing.acompanhamentos,
    ativo: body.ativo === false ? 0 : body.ativo === true ? 1 : existing.ativo,
  })

  const updated = db.prepare('SELECT * FROM pratos WHERE id = ?').get(req.params.id) as PratoRow
  res.json(rowToPrato(updated))
})

// PATCH /api/pratos/:id/toggle — ativa ou desativa um prato
router.patch('/:id/toggle', requireAuth, (req: Request, res: Response): void => {
  const row = db
    .prepare('SELECT ativo FROM pratos WHERE id = ?')
    .get(req.params.id) as { ativo: number } | undefined

  if (!row) {
    res.status(404).json({ error: 'Prato não encontrado.' })
    return
  }

  const novoEstado = row.ativo === 1 ? 0 : 1
  db.prepare("UPDATE pratos SET ativo = ?, atualizado_em = datetime('now') WHERE id = ?")
    .run(novoEstado, req.params.id)

  res.json({ id: req.params.id, ativo: novoEstado === 1 })
})

// DELETE /api/pratos/:id — remove definitivamente
router.delete('/:id', requireAuth, (req: Request, res: Response): void => {
  const result = db
    .prepare('DELETE FROM pratos WHERE id = ?')
    .run(req.params.id)

  if (result.changes === 0) {
    res.status(404).json({ error: 'Prato não encontrado.' })
    return
  }

  res.json({ message: 'Prato removido com sucesso.' })
})

export default router
