import { Router } from 'express'
import { AuthController } from './auth.controller.js'
import { AuthModel } from './auth.model.js'
import { validateRequest } from '../../middlewares/validate-request.js'
import { loginSchema } from './auth.schema.js'
import { requireAuth } from '../../middlewares/require-auth.js'

export const authRoutes = Router()
const authController = new AuthController({
  authModel: AuthModel,
})

authRoutes.post(
  '/login',
  validateRequest({ body: loginSchema }),
  authController.login,
)
authRoutes.get('/me', requireAuth, authController.me)
authRoutes.post('/logout', requireAuth, authController.logout)
