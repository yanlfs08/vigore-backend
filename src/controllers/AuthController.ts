import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

export class AuthController {
  async login(req: Request, res: Response) {
    const { email, password } = req.body

    const user = await prisma.usuario.findUnique({ where: { email } })

    if (!user) {
      return res.status(401).json({ error: 'E-mail ou senha incorretos' })
    }

    if (!user.ativo) {
      return res.status(401).json({ error: 'Usuário desativado' })
    }

    const isValidPassword = await bcrypt.compare(password, user.senha_hash)

    if (!isValidPassword) {
      return res.status(401).json({ error: 'E-mail ou senha incorretos' })
    }

    const token = jwt.sign({ id: user.id, role: user.tipo_permissao }, process.env.JWT_SECRET || 'default', {
      expiresIn: '1d',
    })

    // Remove a senha do retorno
    const { senha_hash, ...userWithoutPassword } = user

    return res.json({
      user: userWithoutPassword,
      token,
    })
  }
}
