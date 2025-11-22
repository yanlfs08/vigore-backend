import dotenv from 'dotenv'
import http from 'http'
import { Server } from 'socket.io'
import app from './app'
import { setupWebSocket } from './websocket' // Nossa função

dotenv.config()

const PORT = process.env.PORT || 3001

// 1. Criamos o servidor HTTP usando o app Express
const httpServer = http.createServer(app)

// 2. Acoplamos o Socket.io nesse servidor
const io = new Server(httpServer, {
  cors: {
    origin: '*', // Em produção, coloque o domínio do frontend
    methods: ['GET', 'POST'],
  },
})

// 3. Iniciamos a lógica do chat
setupWebSocket(io)

// 4. Iniciamos o servidor (agora usamos httpServer.listen, não app.listen)
httpServer.listen(PORT, () => {
  console.log(`
  ########################################################
  🛡️  Servidor HTTP + WebSocket rodando na porta: ${PORT} 🛡️
  ########################################################
  `)
})
