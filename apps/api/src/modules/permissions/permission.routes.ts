import { Router } from 'express'
import { requireAuth } from '../../middlewares/require-auth.js'
import { requirePermission } from '../auth/require-permission.js'
import { validateRequest } from '../../middlewares/validate-request.js'
import {
  createPermissionSchema,
  permissionIdParamsSchema,
  updatePermissionSchema,
} from './permission.schema.js'
import { PermissionController } from './permission.controller.js'

export const permissionRoutes = Router()
const permissionController = new PermissionController()

permissionRoutes.use(requireAuth)
permissionRoutes.get(
  '/',
  requirePermission({ permission: 'permissions:read' }),
  permissionController.findAll,
)
permissionRoutes.get(
  '/:id',
  requirePermission({ permission: 'permissions:read' }),
  validateRequest({ params: permissionIdParamsSchema }),
  permissionController.findById,
)
permissionRoutes.post(
  '/',
  requirePermission({ permission: 'permissions:create' }),
  validateRequest({ body: createPermissionSchema }),
  permissionController.create,
)
permissionRoutes.put(
  '/:id',
  requirePermission({ permission: 'permissions:update' }),
  validateRequest({ params: permissionIdParamsSchema, body: updatePermissionSchema }),
  permissionController.update,
)
permissionRoutes.patch(
  '/:id/activate',
  requirePermission({ permission: 'permissions:update' }),
  validateRequest({ params: permissionIdParamsSchema }),
  permissionController.activate,
)
permissionRoutes.patch(
  '/:id/deactivate',
  requirePermission({ permission: 'permissions:update' }),
  validateRequest({ params: permissionIdParamsSchema }),
  permissionController.deactivate,
)
