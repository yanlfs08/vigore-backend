import { Server, Socket } from 'socket.io'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface TokenPayload {
  id: number
  role: string
}

export function setupWebSocket(io: Server) {
  // Middleware de Autenticação do Socket
  io.use((socket, next) => {
    const token = socket.handshake.auth.token // O Frontend manda o token aqui

    if (!token) {
      return next(new Error('Autenticação necessária'))
    }

    try {
      const secret = process.env.JWT_SECRET || 'default'
      const decoded = jwt.verify(token, secret) as TokenPayload

      // Salvamos o ID do usuário dentro do objeto socket para usar depois
      ;(socket as any).userId = decoded.id
      next()
    } catch (err) {
      next(new Error('Token inválido'))
    }
  })

  // Quando alguém conecta
  io.on('connection', (socket: Socket) => {
    const userId = (socket as any).userId

    console.log(`Usuário ${userId} conectou no chat.`)

    // 1. Entrar numa "sala" exclusiva do usuário
    // Isso permite mandar mensagem privada: io.to("user_5").emit(...)
    socket.join(`user_${userId}`)

    // 2. Evento: Enviar Mensagem
    socket.on('send_message', async (data) => {
      const { destinatarioId, conteudo } = data

      // Salva no Banco (Persistência)
      const mensagemSalva = await prisma.mensagem.create({
        data: {
          remetenteId: userId,
          destinatarioId: Number(destinatarioId),
          conteudo,
        },
        include: {
          remetente: { select: { id: true, nome_completo: true } },
        },
      })

      // Envia em tempo real para o Destinatário (se ele estiver online)
      io.to(`user_${destinatarioId}`).emit('receive_message', mensagemSalva)

      // Devolve para quem enviou (para confirmar e aparecer na tela dele)
      socket.emit('message_sent', mensagemSalva)
    })

    socket.on('disconnect', () => {
      console.log(`Usuário ${userId} desconectou.`)
    })
  })
}
