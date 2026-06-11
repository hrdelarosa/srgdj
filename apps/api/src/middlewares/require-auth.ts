import type { RequestHandler } from 'express'
import jwt from 'jsonwebtoken'
import { AppError } from '../utils/errors/app-error.js'
import { AuthModel } from '../modules/auth/auth.model.js'
import { hashToken } from '../utils/auth/hashToken.js'

type JwtPayload = {
  sub: string
  username: string
  role: string
}

export const requireAuth: RequestHandler = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader?.startsWith('Bearer ')) {
      throw new AppError({
        message: 'No autenticado',
        statusCode: 401,
        code: 'UNAUTHORIZED',
      })
    }

    const token = authHeader.replace('Bearer ', '')
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload
    const session = await AuthModel.findValidSessionByTokenHash({
      tokenHash: hashToken(token),
    })

    if (!session) {
      throw new AppError({
        message: 'Sesión no válida',
        statusCode: 401,
        code: 'INVALID_SESSION',
      })
    }

    const now = new Date()

    if (session.revokedAt) {
      throw new AppError({
        message: 'Sesión revocada',
        statusCode: 401,
        code: 'REVOKED_SESSION',
      })
    }

    if (session.expiresAt < now) {
      throw new AppError({
        message: 'Sesión expirada',
        statusCode: 401,
        code: 'EXPIRED_SESSION',
      })
    }

    const inactivityMinutes = Number(
      process.env.SESSION_INACTIVITY_MINUTES ?? 30,
    )
    const inactiveMs = now.getTime() - session.lastActivityAt.getTime()
    const maxInactiveMs = inactivityMinutes * 60 * 1000

    if (inactiveMs > maxInactiveMs) {
      await AuthModel.revokeSession({ sessionId: session.id })
      throw new AppError({
        message: 'Sesión expirada por inactividad',
        statusCode: 401,
        code: 'SESSION_INACTIVE',
      })
    }

    await AuthModel.touchSession({ sessionId: session.id, date: now })

    const permissions = await AuthModel.findPermissionsByRoleId({
      roleId: session.user.role.id,
    })

    req.user = {
      id: session.user.id,
      username: session.user.username,
      role: session.user.role,
      permissions: permissions.map((permission) => permission.code),
    }

    req.sessionId = session.id

    next()
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      return next(
        new AppError({
          message: 'Token expirado',
          statusCode: 401,
          code: 'TOKEN_EXPIRED',
        }),
      )
    }

    if (err instanceof jwt.JsonWebTokenError) {
      return next(
        new AppError({
          message: 'Token inválido',
          statusCode: 401,
          code: 'INVALID_TOKEN',
        }),
      )
    }

    next(err)
  }
}
