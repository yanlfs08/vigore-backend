import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

interface TokenPayload {
  id: number
  role: string
  iat: number
  exp: number
}

export function AuthMiddleware(req: Request, res: Response, next: NextFunction) {
  const { authorization } = req.headers

  if (!authorization) {
    return res.status(401).json({ error: 'Token não fornecido' })
  }

  // O token vem como "Bearer eyJhbGci..."
  const [, token] = authorization.split(' ')

  try {
    const secret = process.env.JWT_SECRET || 'default'
    const decoded = jwt.verify(token, secret)

    const { id, role } = decoded as TokenPayload

    // Injetamos o ID do usuário na requisição para usar nos controllers
    ;(req as any).user = { id, role }

    return next()
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido' })
  }
}
