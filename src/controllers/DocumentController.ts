import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export class DocumentController {
  // Listar Documentos de um Paciente (Histórico) [cite: 89]
  async index(req: Request, res: Response) {
    const { id_paciente } = req.params

    const docs = await prisma.documento.findMany({
      where: { id_paciente: Number(id_paciente) },
      include: { medico: { select: { nome_completo: true, crm: true } } },
      orderBy: { data_geracao: 'desc' },
    })

    return res.json(docs)
  }

  // Gerar e Salvar Documento [cite: 86]
  async create(req: Request, res: Response) {
    try {
      const { id_paciente, id_medico, tipo_documento, conteudo_gerado, dados_json } = req.body

      // Aqui poderíamos ter uma lógica para pegar o Template e substituir variáveis,
      // mas vamos assumir que o Frontend já manda o texto pronto ou semi-pronto por enquanto.

      const documento = await prisma.documento.create({
        data: {
          id_paciente,
          id_medico,
          tipo_documento,
          conteudo_gerado, // O texto final do atestado/receita
          dados_especificos_json: dados_json || {},
        },
      })

      return res.status(201).json(documento)
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao gerar documento' })
    }
  }
}
