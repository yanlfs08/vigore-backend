import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export class PatientController {
  // Listar Pacientes (Com busca por Nome ou CPF)
  async index(req: Request, res: Response) {
    try {
      const { search } = req.query

      const where = search
        ? {
            OR: [
              { nome_completo: { contains: String(search), mode: 'insensitive' as const } },
              { cpf: { contains: String(search) } },
            ],
          }
        : {}

      const pacientes = await prisma.paciente.findMany({
        where,
        orderBy: { nome_completo: 'asc' },
        take: 50,
      })

      return res.json(pacientes)
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao buscar pacientes' })
    }
  }

  // Cadastrar Novo Paciente
  async create(req: Request, res: Response) {
    try {
      const {
        nome_completo,
        cpf,
        telefone_principal,
        data_nascimento,
        data_primeira_consulta,
        email,
        endereco,
        canal_captacao,
      } = req.body

      // Validação de CPF único
      if (cpf) {
        const existe = await prisma.paciente.findUnique({ where: { cpf } })
        if (existe) return res.status(400).json({ error: 'CPF já cadastrado.' })
      }

      const paciente = await prisma.paciente.create({
        data: {
          nome_completo,
          cpf,
          telefone_principal,
          email,
          endereco,
          canal_captacao,
          // Convertendo strings de data para Objeto Date
          data_nascimento: data_nascimento ? new Date(data_nascimento) : null,
          data_primeira_consulta: new Date(data_primeira_consulta), // Obrigatório
        },
      })

      return res.status(201).json(paciente)
    } catch (error) {
      console.error(error)
      return res.status(500).json({ error: 'Erro ao criar paciente' })
    }
  }
}
