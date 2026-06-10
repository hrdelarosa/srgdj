import { Router } from 'express'
import { AuthController } from './auth.controller.js'
import { AuthModel } from './auth.model.js'
import { validateRequest } from '../../middlewares/validate-request.js'
import { loginSchema } from './auth.schema.js'

export const authRoutes = Router()
const authController = new AuthController({
  authModel: AuthModel,
})

authRoutes.post(
  '/login',
  validateRequest({ body: loginSchema }),
  authController.login,
)
