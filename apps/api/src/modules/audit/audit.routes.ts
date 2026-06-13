import { Router } from 'express'
import { requireAuth } from '../../middlewares/require-auth.js'
import { requirePermission } from '../auth/require-permission.js'
import { validateRequest } from '../../middlewares/validate-request.js'
import { auditQuerySchema } from './audit.schema.js'
import { AuditController } from './audit.controller.js'

export const auditRoutes = Router()
const auditController = new AuditController()

auditRoutes.use(requireAuth)
auditRoutes.get(
  '/',
  requirePermission({ permission: 'audit:read' }),
  validateRequest({ query: auditQuerySchema }),
  auditController.findAll,
)
