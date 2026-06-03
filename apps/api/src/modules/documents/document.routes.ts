import { Router } from 'express'
import { documentController } from './document.controller.js'
import { validateRequest } from '../../middlewares/validate-request.js'
import {
  createDocumentSchema,
  documentIdParamsSchema,
  updateDocumentSchema,
} from './document.schema.js'

export const documentRoutes = Router()

documentRoutes.get('/', documentController.findAll)
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
documentRoutes.delete(
  '/:id',
  validateRequest({ params: documentIdParamsSchema }),
  documentController.remove,
)
