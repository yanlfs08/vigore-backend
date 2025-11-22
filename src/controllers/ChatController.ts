import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export class ChatController {
  // Busca conversa entre EU (logado) e OUTRA PESSOA
  async getHistory(req: Request, res: Response) {
    try {
      const meuId = (req as any).user.id
      const outroUsuarioId = Number(req.params.id)

      const mensagens = await prisma.mensagem.findMany({
        where: {
          OR: [
            { remetenteId: meuId, destinatarioId: outroUsuarioId },
            { remetenteId: outroUsuarioId, destinatarioId: meuId },
          ],
        },
        orderBy: { data_envio: 'asc' }, // Mais antigas primeiro
        take: 100, // Limita as últimas 100
      })

      return res.json(mensagens)
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao buscar histórico.' })
    }
  }

  // Listar com quem eu já conversei (opcional, para montar a lista lateral)
  async getContacts(req: Request, res: Response) {
    // Implementação futura para listar contatos recentes
    return res.json([])
  }
}
