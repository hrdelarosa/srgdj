import { RequestHandler } from 'express'
import { AppError } from '../../utils/errors/app-error.js'

export function requirePermission({
  permission,
}: {
  permission: string
}): RequestHandler {
  return (req, res, next) => {
    if (!req.user) {
      return next(
        new AppError({
          message: 'No autenticado',
          statusCode: 401,
          code: 'UNAUTHORIZED',
        }),
      )
    }

    if (!req.user.permissions.includes(permission)) {
      return next(
        new AppError({
          message: 'No autorizado',
          statusCode: 403,
          code: 'FORBIDDEN',
        }),
      )
    }

    return next()
  }
}
