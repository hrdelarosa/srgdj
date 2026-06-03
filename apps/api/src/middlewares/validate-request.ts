import type { RequestHandler } from 'express'
import type { ZodType } from 'zod'
import { ZodError } from 'zod'

interface ValidateSchemaOptions {
  body?: ZodType<any>
  params?: ZodType<any>
  query?: ZodType<any>
}

export function validateRequest(
  schemas: ValidateSchemaOptions,
): RequestHandler {
  return async (req, res, next) => {
    try {
      if (schemas.body) req.body = await schemas.body.parseAsync(req.body)

      if (schemas.params)
        req.params = await schemas.params.parseAsync(req.params)

      if (schemas.query) req.query = await schemas.query.parseAsync(req.query)

      next()
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Validation error',
            details: error.issues.map((issue) => ({
              field: issue.path.join('.'),
              message: issue.message,
            })),
          },
        })
      }

      next(error)
    }
  }
}
