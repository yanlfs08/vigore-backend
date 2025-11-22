import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export class UserController {
  // Listar Usuários
  async index(req: Request, res: Response) {
    try {
      const users = await prisma.usuario.findMany({
        select: {
          id: true,
          nome_completo: true,
          email: true,
          tipo_permissao: true,
          crm: true,
          telefone: true,
          ativo: true,
        },
        orderBy: { nome_completo: 'asc' },
      })
      return res.json(users)
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao listar usuários' })
    }
  }
  // Criar Usuário
  async create(req: Request, res: Response) {
    try {
      const { nome_completo, email, password, tipo_permissao, crm, telefone } = req.body
      const userRole = (req as any).user?.role
      if (userRole !== 'ADMIN') {
        return res.status(403).json({ error: 'Apenas administradores podem criar usuários.' })
      }
      const userExists = await prisma.usuario.findUnique({ where: { email } })
      if (userExists) return res.status(400).json({ error: 'E-mail já cadastrado' })
      const hash = await bcrypt.hash(password, 10)
      const user = await prisma.usuario.create({
        data: {
          nome_completo,
          email,
          senha_hash: hash,
          tipo_permissao,
          crm,
          telefone,
        },
      })
      const { senha_hash, ...rest } = user
      return res.status(201).json(rest)
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao criar usuário' })
    }
  }

  // Atualizar Usuário
  async update(req: Request, res: Response) {
    try {
      const id = Number(req.params.id)
      const { nome_completo, email, password, tipo_permissao, crm, telefone, ativo } = req.body
      // --- CORREÇÃO AQUI: Usando (req as any) para pegar role e id ---
      const requestingUser = (req as any).user
      // 1. Segurança: Só ADMIN altera outros usuários
      if (requestingUser?.role !== 'ADMIN') {
        // Uma exceção: O próprio usuário pode editar seus dados
        if (requestingUser?.id !== id) {
          return res.status(403).json({ error: 'Sem permissão para editar este usuário.' })
        }
      }
      // 2. Verificar se usuário existe
      const user = await prisma.usuario.findUnique({ where: { id } })
      if (!user) return res.status(404).json({ error: 'Usuário não encontrado' })
      // 3. Validar e-mail único
      if (email && email !== user.email) {
        const emailExists = await prisma.usuario.findUnique({ where: { email } })
        if (emailExists) return res.status(400).json({ error: 'Este e-mail já está em uso por outro usuário.' })
      }
      // 4. Preparar dados
      let dataToUpdate: any = {
        nome_completo,
        email,
        tipo_permissao,
        crm,
        telefone,
        ativo,
      }
      if (password) {
        const hash = await bcrypt.hash(password, 10)
        dataToUpdate.senha_hash = hash
      }
      const updatedUser = await prisma.usuario.update({
        where: { id },
        data: dataToUpdate,
      })
      const { senha_hash, ...rest } = updatedUser
      return res.json(rest)
    } catch (error) {
      console.error(error)
      return res.status(500).json({ error: 'Erro ao atualizar usuário' })
    }
  }
  // --- Trocar Senha ---
  async changePassword(req: Request, res: Response) {
    try {
      const id_usuario = (req as any).user.id // Pega o ID de quem está logado
      const { senha_antiga, nova_senha } = req.body
      if (!senha_antiga || !nova_senha) {
        return res.status(400).json({ error: 'Informe a senha antiga e a nova senha.' })
      }
      // 1. Buscar o usuário para pegar a hash atual
      const user = await prisma.usuario.findUnique({ where: { id: id_usuario } })
      if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' })
      // 2. Verificar se a senha antiga está correta
      const checkPassword = await bcrypt.compare(senha_antiga, user.senha_hash)
      if (!checkPassword) {
        return res.status(401).json({ error: 'A senha antiga está incorreta.' })
      }
      // 3. Criptografar a nova senha e atualizar
      const newHash = await bcrypt.hash(nova_senha, 10)
      await prisma.usuario.update({
        where: { id: id_usuario },
        data: { senha_hash: newHash },
      })
      return res.json({ message: 'Senha alterada com sucesso.' })
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao alterar senha.' })
    }
  }
}
