import { Router, type Request, type Response } from 'express'
import db from '../db'
import { requireAuth } from '../middleware/auth'

const router = Router()

// GET /api/dashboard — resumo geral para o painel admin
router.get('/', requireAuth, (_req: Request, res: Response): void => {
  const totalPratos = (db.prepare('SELECT COUNT(*) as n FROM pratos').get() as { n: number }).n
  const pratosAtivos = (db.prepare('SELECT COUNT(*) as n FROM pratos WHERE ativo = 1').get() as { n: number }).n
  const pratosInativos = totalPratos - pratosAtivos

  const totalContatos = (db.prepare('SELECT COUNT(*) as n FROM contatos').get() as { n: number }).n
  const contatosNaoLidos = (db.prepare('SELECT COUNT(*) as n FROM contatos WHERE lido = 0').get() as { n: number }).n

  const porCategoria = db.prepare(`
    SELECT categoria, COUNT(*) as total
    FROM pratos
    WHERE ativo = 1
    GROUP BY categoria
    ORDER BY total DESC
  `).all() as Array<{ categoria: string; total: number }>

  const ultimosContatos = db.prepare(`
    SELECT id, nome, email, lido, criado_em
    FROM contatos
    ORDER BY criado_em DESC
    LIMIT 5
  `).all()

  const ultimosPratos = db.prepare(`
    SELECT id, nome, categoria, ativo, atualizado_em
    FROM pratos
    ORDER BY atualizado_em DESC
    LIMIT 5
  `).all()

  res.json({
    pratos: {
      total: totalPratos,
      ativos: pratosAtivos,
      inativos: pratosInativos,
      porCategoria,
    },
    contatos: {
      total: totalContatos,
      naoLidos: contatosNaoLidos,
    },
    ultimosContatos,
    ultimosPratos,
  })
})

export default router
