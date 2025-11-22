import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export class ScheduleConfigController {
  // 1. Definir Agenda Padrão (Recorrente)
  // Aberto para Recepção, Médicos e Admin
  async upsertStandard(req: Request, res: Response) {
    try {
      const { id_medico, horarios } = req.body

      // Nota: Não fazemos mais verificação de cargo aqui.
      // Se o usuário tem Token (está logado), ele pode editar.

      // Transação: Apaga a agenda antiga desse médico e cria a nova
      await prisma.$transaction([
        prisma.agendaPadrao.deleteMany({ where: { id_medico } }),
        prisma.agendaPadrao.createMany({
          data: horarios.map((h: any) => ({
            id_medico,
            dia_semana: h.dia_semana,
            horario_inicio: h.horario_inicio,
            horario_fim: h.horario_fim,
          })),
        }),
      ])

      return res.json({ message: 'Agenda padrão atualizada com sucesso.' })
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao salvar agenda.' })
    }
  }

  // 2. Obter Agenda Padrão
  async getStandard(req: Request, res: Response) {
    try {
      const { id_medico } = req.params
      const agenda = await prisma.agendaPadrao.findMany({
        where: { id_medico: Number(id_medico) },
        orderBy: { dia_semana: 'asc' },
      })
      return res.json(agenda)
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao buscar agenda padrão.' })
    }
  }

  // 3. Criar Bloqueio (Exceção/Folga)
  async addBlock(req: Request, res: Response) {
    try {
      const { id_medico, data_inicio, data_fim, motivo } = req.body

      // Qualquer usuário logado pode bloquear a agenda de um médico
      // (Útil para a recepção lançar "Médico doente" ou "Congresso")
      const bloqueio = await prisma.bloqueioAgenda.create({
        data: {
          id_medico,
          data_inicio: new Date(data_inicio),
          data_fim: new Date(data_fim),
          motivo,
        },
      })

      return res.status(201).json(bloqueio)
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao criar bloqueio.' })
    }
  }

  // 4. Listar Bloqueios (Futuros)
  async getBlocks(req: Request, res: Response) {
    try {
      const { id_medico } = req.params
      const bloqueios = await prisma.bloqueioAgenda.findMany({
        where: {
          id_medico: Number(id_medico),
          data_fim: { gte: new Date() },
        },
        orderBy: { data_inicio: 'asc' },
      })
      return res.json(bloqueios)
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao buscar bloqueios.' })
    }
  }

  // 5. Remover Bloqueio (Caso o médico decida trabalhar no feriado ou cancele a folga)
  async removeBlock(req: Request, res: Response) {
    try {
      const { id } = req.params
      await prisma.bloqueioAgenda.delete({ where: { id: Number(id) } })
      return res.status(204).send()
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao remover bloqueio.' })
    }
  }
}
