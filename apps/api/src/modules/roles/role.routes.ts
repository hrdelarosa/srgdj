import { Router } from 'express'
import { RoleController } from './role.controller.js'
import { RoleModel } from './role.model.js'
import { requireAuth } from '../../middlewares/require-auth.js'
import { requirePermission } from '../auth/require-permission.js'
import { validateRequest } from '../../middlewares/validate-request.js'
import { roleIdParamsSchema } from './role.schema.js'

export const roleRoutes = Router()
const roleController = new RoleController({
  roleModel: RoleModel,
})

roleRoutes.use(requireAuth)

roleRoutes.get(
  '/',
  requirePermission({ permission: 'users:read' }),
  roleController.findAll,
)
roleRoutes.get(
  '/:id',
  requirePermission({ permission: 'users:read' }),
  validateRequest({ params: roleIdParamsSchema }),
  roleController.findById,
)
