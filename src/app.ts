import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { PrismaClient } from '@prisma/client'

// Instância do Prisma para conectar no banco
const prisma = new PrismaClient()

const app = express()

// Middlewares básicos de segurança e JSON
app.use(helmet())
app.use(cors())
app.use(express.json())

// Rota Raiz (Para saber se o servidor está online)
app.get('/', (req, res) => {
  res.json({
    message: 'Sistema Clínica Vigore - Backend Online 🚀',
    timestamp: new Date(),
  })
})

// Rota de Teste de Banco de Dados (Health Check)
app.get('/status', async (req, res) => {
  try {
    // Tenta fazer uma query simples no banco
    await prisma.$queryRaw`SELECT 1`

    res.json({
      status: 'ok',
      database: 'connected',
      message: 'O servidor acessou o PostgreSQL com sucesso!',
    })
  } catch (error) {
    console.error('Erro no banco:', error)
    res.status(500).json({
      status: 'error',
      database: 'disconnected',
      error: 'Não foi possível conectar ao banco de dados.',
    })
  }
})

export default app
