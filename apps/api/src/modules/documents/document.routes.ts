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

export const documentRoutes = Router()
const documentController = new DocumentController({
  documentModel: DocumentModel,
})

documentRoutes.get(
  '/',
  validateRequest({ query: findAllDocumentsQuerySchema }),
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
