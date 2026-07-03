import { Router } from 'express'
import { DocumentController } from './document.controller.js'
import { DocumentModel } from './document.model.js'
import { validateRequest } from '../../middlewares/validate-request.js'
import {
  createDocumentSchema,
  documentIdParamsSchema,
  updateDocumentSchema,
} from '@srgdj/shared'
import {
  createDocumentEventSchema,
  documentQuerySchema,
} from './document.schema.js'
import { requireAuth } from '../../middlewares/require-auth.js'
import { requirePermission } from '../auth/require-permission.js'

export const documentRoutes = Router()
const documentController = new DocumentController({
  documentModel: DocumentModel,
})

documentRoutes.use(requireAuth)
documentRoutes.get(
  '/',
  requirePermission({ permission: 'documents:read' }),
  validateRequest({ query: documentQuerySchema }),
  documentController.findAll,
)
documentRoutes.get(
  '/:id',
  requirePermission({ permission: 'documents:read' }),
  validateRequest({ params: documentIdParamsSchema }),
  documentController.findById,
)
documentRoutes.post(
  '/',
  requirePermission({ permission: 'documents:create' }),
  validateRequest({ body: createDocumentSchema }),
  documentController.create,
)
documentRoutes.patch(
  '/:id',
  requirePermission({ permission: 'documents:update' }),
  validateRequest({
    params: documentIdParamsSchema,
    body: updateDocumentSchema,
  }),
  documentController.update,
)
documentRoutes.patch(
  '/delete/:id',
  requirePermission({ permission: 'documents:delete' }),
  validateRequest({ params: documentIdParamsSchema }),
  documentController.delete,
)
documentRoutes.delete(
  '/remove/:id',
  requirePermission({ permission: 'documents:remove' }),
  validateRequest({ params: documentIdParamsSchema }),
  documentController.remove,
)

documentRoutes.get(
  '/:id/events',
  requirePermission({ permission: 'documents:read' }),
  validateRequest({ params: documentIdParamsSchema }),
  documentController.findEventsByDocumentId,
)
documentRoutes.post(
  '/:id/events',
  requirePermission({ permission: 'documents:events:create' }),
  validateRequest({
    params: documentIdParamsSchema,
    body: createDocumentEventSchema,
  }),
  documentController.createEvent,
)
