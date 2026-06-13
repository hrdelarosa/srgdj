import { Router } from 'express'
import { UserController } from './user.controller.js'
import { UserModel } from './user.model.js'
import { requireAuth } from '../../middlewares/require-auth.js'
import { requirePermission } from '../auth/require-permission.js'
import { validateRequest } from '../../middlewares/validate-request.js'
import {
  createUserSchema,
  updateUserSchema,
  userIdParamsSchema,
} from './user.schema.js'

export const userRoutes = Router()
const userController = new UserController({
  userModel: UserModel,
})

userRoutes.use(requireAuth)

userRoutes.get(
  '/',
  requirePermission({ permission: 'users:read' }),
  userController.findAll,
)
userRoutes.get(
  '/:id',
  requirePermission({ permission: 'users:read' }),
  validateRequest({ params: userIdParamsSchema }),
  userController.findById,
)
userRoutes.post(
  '/',
  requirePermission({ permission: 'users:create' }),
  validateRequest({ body: createUserSchema }),
  userController.create,
)
userRoutes.put(
  '/:id',
  requirePermission({ permission: 'users:update' }),
  validateRequest({ params: userIdParamsSchema, body: updateUserSchema }),
  userController.update,
)
userRoutes.patch(
  '/:id/desactivate',
  requirePermission({ permission: 'users:deactivate' }),
  validateRequest({ params: userIdParamsSchema }),
  userController.desactivate,
)
userRoutes.patch(
  '/:id/activate',
  requirePermission({ permission: 'users:deactivate' }),
  validateRequest({ params: userIdParamsSchema }),
  userController.activate,
)
