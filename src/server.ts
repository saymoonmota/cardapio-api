import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import authRoutes from './routes/auth'
import pratosRoutes from './routes/pratos'
import contatosRoutes from './routes/contatos'
import dashboardRoutes from './routes/dashboard'

const app = express()
const PORT = parseInt(process.env.PORT ?? '3001', 10)

// ─── Middlewares globais ─────────────────────────────────────────────────────

app.use(cors({
  origin: process.env.FRONTEND_URL ?? 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))

app.use(express.json())

// ─── Rotas ───────────────────────────────────────────────────────────────────

app.use('/api/auth', authRoutes)
app.use('/api/pratos', pratosRoutes)
app.use('/api/contatos', contatosRoutes)
app.use('/api/dashboard', dashboardRoutes)

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// 404 para rotas não encontradas
app.use((_req, res) => {
  res.status(404).json({ error: 'Rota não encontrada.' })
})

// ─── Inicialização ───────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`\n🚀 Cardapio API rodando em http://localhost:${PORT}`)
  console.log(`   Health: http://localhost:${PORT}/api/health`)
  console.log(`   Docs:   veja README.md\n`)
})

export default app
