import { Router } from 'express'
import { DocumentController } from './document.controller.js'
import { DocumentModel } from './document.model.js'
import { validateRequest } from '../../middlewares/validate-request.js'
import {
  createDocumentSchema,
  documentIdParamsSchema,
  findAllDocumentsQuerySchema,
  updateDocumentSchema,
} from '@srgdj/shared'
import {
  createDocumentEventSchema,
  documentQuerySchema,
} from './document.schema.js'
import { requireAuth } from '../../middlewares/require-auth.js'

export const documentRoutes = Router()
const documentController = new DocumentController({
  documentModel: DocumentModel,
})

documentRoutes.use(requireAuth)
documentRoutes.get(
  '/',
  validateRequest({ query: documentQuerySchema }),
  documentController.findAll,
)
documentRoutes.get(
  '/:id',
  validateRequest({ params: documentIdParamsSchema }),
  documentController.findById,
)
documentRoutes.post(
  '/',
  validateRequest({ body: createDocumentSchema }),
  documentController.create,
)
documentRoutes.patch(
  '/:id',
  validateRequest({
    params: documentIdParamsSchema,
    body: updateDocumentSchema,
  }),
  documentController.update,
)
documentRoutes.patch(
  '/delete/:id',
  validateRequest({ params: documentIdParamsSchema }),
  documentController.delete,
)
documentRoutes.delete(
  '/remove/:id',
  validateRequest({ params: documentIdParamsSchema }),
  documentController.remove,
)

documentRoutes.get(
  '/:id/events',
  validateRequest({ params: documentIdParamsSchema }),
  documentController.findEventsByDocumentId,
)
documentRoutes.post(
  '/:id/events',
  validateRequest({
    params: documentIdParamsSchema,
    body: createDocumentEventSchema,
  }),
  documentController.createEvent,
)
