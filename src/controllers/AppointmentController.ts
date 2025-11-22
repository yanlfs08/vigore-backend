import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export class AppointmentController {
  // Listar Agenda (Filtro por dia e médico)
  async index(req: Request, res: Response) {
    try {
      const { start_date, end_date, id_medico } = req.query

      // Define o intervalo (Se não enviado, pega o dia de hoje inteiro)
      const start = start_date ? new Date(String(start_date)) : new Date()
      start.setHours(0, 0, 0, 0)

      const end = end_date ? new Date(String(end_date)) : new Date()
      end.setHours(23, 59, 59, 999)

      const where: any = {
        data_hora_inicio: { gte: start, lte: end },
      }

      // Se passar id_medico, filtra. Se não, mostra de todos.
      if (id_medico) {
        where.id_medico = Number(id_medico)
      }

      const agendamentos = await prisma.agendamento.findMany({
        where,
        include: {
          paciente: { select: { id: true, nome_completo: true, telefone_principal: true } },
          medico: { select: { id: true, nome_completo: true } },
          procedimento: { select: { nome: true, duracao_media_minutos: true } },
        },
        orderBy: { data_hora_inicio: 'asc' },
      })

      return res.json(agendamentos)
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao buscar agenda' })
    }
  }

  // Criar Agendamento
  async create(req: Request, res: Response) {
    try {
      const { id_paciente, id_medico, id_procedimento_principal, data_hora_inicio, motivo_consulta, tipo_consulta } =
        req.body

      const dataInicio = new Date(data_hora_inicio)

      // Validação simples: O médico já tem algo nesse horário exato?
      const conflito = await prisma.agendamento.findFirst({
        where: {
          id_medico,
          data_hora_inicio: dataInicio,
          status_agendamento: { not: 'CANCELADO' },
        },
      })

      if (conflito) {
        return res.status(409).json({ error: 'Horário indisponível para este médico.' })
      }

      const agendamento = await prisma.agendamento.create({
        data: {
          id_paciente,
          id_medico,
          id_procedimento_principal, // ID do procedimento "Consulta de Rotina" (ex: 1)
          data_hora_inicio: dataInicio,
          motivo_consulta,
          tipo_consulta: tipo_consulta || 'PRIMEIRA_CONSULTA',
          status_agendamento: 'CONFIRMADO',
        },
      })

      return res.status(201).json(agendamento)
    } catch (error) {
      console.error(error)
      return res.status(500).json({ error: 'Erro ao agendar' })
    }
  }
}
