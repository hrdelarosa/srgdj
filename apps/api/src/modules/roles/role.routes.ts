import { Router } from 'express'
import { RoleController } from './role.controller.js'
import { RoleModel } from './role.model.js'
import { requireAuth } from '../../middlewares/require-auth.js'
import { requirePermission } from '../auth/require-permission.js'
import { validateRequest } from '../../middlewares/validate-request.js'
import {
  createRoleSchema,
  roleIdParamsSchema,
  updateRolePermissionsSchema,
  updateRoleSchema,
} from './role.schema.js'

export const roleRoutes = Router()
const roleController = new RoleController({
  roleModel: RoleModel,
})

roleRoutes.use(requireAuth)

roleRoutes.get(
  '/',
  requirePermission({ permission: 'roles:read' }),
  roleController.findAll,
)
roleRoutes.get(
  '/:id',
  requirePermission({ permission: 'roles:read' }),
  validateRequest({ params: roleIdParamsSchema }),
  roleController.findById,
)
roleRoutes.post(
  '/',
  requirePermission({ permission: 'roles:create' }),
  validateRequest({ body: createRoleSchema }),
  roleController.create,
)
roleRoutes.put(
  '/:id',
  requirePermission({ permission: 'roles:update' }),
  validateRequest({ params: roleIdParamsSchema, body: updateRoleSchema }),
  roleController.update,
)
roleRoutes.patch(
  '/:id/activate',
  requirePermission({ permission: 'roles:update' }),
  validateRequest({ params: roleIdParamsSchema }),
  roleController.activate,
)
roleRoutes.patch(
  '/:id/deactivate',
  requirePermission({ permission: 'roles:update' }),
  validateRequest({ params: roleIdParamsSchema }),
  roleController.deactivate,
)
roleRoutes.get(
  '/:id/permissions',
  requirePermission({ permission: 'roles:read' }),
  validateRequest({ params: roleIdParamsSchema }),
  roleController.findPermissions,
)
roleRoutes.put(
  '/:id/permissions',
  requirePermission({ permission: 'roles:permissions:update' }),
  validateRequest({
    params: roleIdParamsSchema,
    body: updateRolePermissionsSchema,
  }),
  roleController.updatePermissions,
)
