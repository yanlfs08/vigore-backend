import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export class ModelDocumentController {
  // Listar todos os modelos (Pode filtrar por tipo: RECEITA, ATESTADO...)
  async index(req: Request, res: Response) {
    try {
      const { tipo } = req.query

      const where = tipo ? { tipo_documento: String(tipo) as any } : {}

      const modelos = await prisma.modeloDocumento.findMany({
        where: { ...where, ativo: true },
        orderBy: { nome_modelo: 'asc' },
      })

      return res.json(modelos)
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao buscar modelos.' })
    }
  }

  // Criar um novo Modelo (Admin)
  async create(req: Request, res: Response) {
    try {
      // Verificação de segurança (Apenas Admin)
      const userRole = (req as any).user?.role
      if (userRole !== 'ADMIN') {
        return res.status(403).json({ error: 'Apenas administradores criam modelos.' })
      }

      const { nome_modelo, tipo_documento, conteudo_template, dados_padrao_json } = req.body

      const modelo = await prisma.modeloDocumento.create({
        data: {
          nome_modelo,
          tipo_documento,
          conteudo_template, // Ex: "Atesto que {paciente} precisa de {dias} dias..."
          dados_padrao_json: dados_padrao_json || {},
        },
      })

      return res.status(201).json(modelo)
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao criar modelo.' })
    }
  }

  // Editar Modelo
  async update(req: Request, res: Response) {
    try {
      const userRole = (req as any).user?.role
      if (userRole !== 'ADMIN') {
        return res.status(403).json({ error: 'Apenas administradores editam modelos.' })
      }

      const { id } = req.params
      const data = req.body

      const modelo = await prisma.modeloDocumento.update({
        where: { id: Number(id) },
        data,
      })

      return res.json(modelo)
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao atualizar modelo.' })
    }
  }

  // Deletar (ou desativar) Modelo
  async delete(req: Request, res: Response) {
    try {
      const userRole = (req as any).user?.role
      if (userRole !== 'ADMIN') return res.status(403).json({ error: 'Sem permissão.' })

      const { id } = req.params

      // Não deletamos de verdade, apenas desativamos para não quebrar histórico
      await prisma.modeloDocumento.update({
        where: { id: Number(id) },
        data: { ativo: false },
      })

      return res.status(204).send()
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao deletar modelo.' })
    }
  }
}
