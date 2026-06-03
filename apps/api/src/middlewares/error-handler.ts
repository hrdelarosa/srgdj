import type { ErrorRequestHandler } from 'express'
import { ZodError } from 'zod'
import { AppError } from '../utils/errors/app-error.js'

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  if (err instanceof ZodError) {
    return res.status(400).json({
      code: 'VALIDATION_ERROR',
      message: 'Invalid request data',
      details: err.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      })),
    })
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
      },
    })
  }

  console.error(err)

  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Unexpected server error',
    },
  })
}
