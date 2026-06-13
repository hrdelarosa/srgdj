import { Router } from 'express'

import { DocumentCatalogController } from './document-catalog.controller.js'
import { DocumentCatalogModel } from './document-catalog.model.js'
import { requireAuth } from '../../middlewares/require-auth.js'
import { requirePermission } from '../auth/require-permission.js'
import { validateRequest } from '../../middlewares/validate-request.js'
import {
  catalogIdParamsSchema,
  createDocumentStatusSchema,
  createDocumentTypeSchema,
  createPhysicalLocationSchema,
  updateDocumentStatusSchema,
  updateDocumentTypeSchema,
  updatePhysicalLocationSchema,
} from './document-catalog.schema.js'

export const documentCatalogRoutes = Router()
const documentCatalogController = new DocumentCatalogController({
  documentCatalogModel: DocumentCatalogModel,
})

documentCatalogRoutes.use(requireAuth)

documentCatalogRoutes.get(
  '/document-types',
  requirePermission({ permission: 'catalogs:read' }),
  documentCatalogController.findDocumentTypes,
)
documentCatalogRoutes.post(
  '/document-types',
  requirePermission({ permission: 'catalogs:create' }),
  validateRequest({ body: createDocumentTypeSchema }),
  documentCatalogController.createDocumentType,
)
documentCatalogRoutes.put(
  '/document-types/:id',
  requirePermission({ permission: 'catalogs:update' }),
  validateRequest({
    params: catalogIdParamsSchema,
    body: updateDocumentTypeSchema,
  }),
  documentCatalogController.updateDocumentType,
)
documentCatalogRoutes.patch(
  '/document-types/:id/activate',
  requirePermission({ permission: 'catalogs:update' }),
  validateRequest({ params: catalogIdParamsSchema }),
  documentCatalogController.activateDocumentType,
)
documentCatalogRoutes.patch(
  '/document-types/:id/deactivate',
  requirePermission({ permission: 'catalogs:update' }),
  validateRequest({ params: catalogIdParamsSchema }),
  documentCatalogController.deactivateDocumentType,
)

documentCatalogRoutes.get(
  '/document-statuses',
  requirePermission({ permission: 'catalogs:read' }),
  documentCatalogController.findDocumentStatuses,
)
documentCatalogRoutes.post(
  '/document-statuses',
  requirePermission({ permission: 'catalogs:create' }),
  validateRequest({ body: createDocumentStatusSchema }),
  documentCatalogController.createDocumentStatus,
)
documentCatalogRoutes.put(
  '/document-statuses/:id',
  requirePermission({ permission: 'catalogs:update' }),
  validateRequest({
    params: catalogIdParamsSchema,
    body: updateDocumentStatusSchema,
  }),
  documentCatalogController.updateDocumentStatus,
)
documentCatalogRoutes.patch(
  '/document-statuses/:id/activate',
  requirePermission({ permission: 'catalogs:update' }),
  validateRequest({ params: catalogIdParamsSchema }),
  documentCatalogController.activateDocumentStatus,
)
documentCatalogRoutes.patch(
  '/document-statuses/:id/deactivate',
  requirePermission({ permission: 'catalogs:update' }),
  validateRequest({ params: catalogIdParamsSchema }),
  documentCatalogController.deactivateDocumentStatus,
)

documentCatalogRoutes.get(
  '/physical-locations',
  requirePermission({ permission: 'catalogs:read' }),
  documentCatalogController.findPhysicalLocations,
)
documentCatalogRoutes.post(
  '/physical-locations',
  requirePermission({ permission: 'catalogs:create' }),
  validateRequest({ body: createPhysicalLocationSchema }),
  documentCatalogController.createPhysicalLocation,
)
documentCatalogRoutes.put(
  '/physical-locations/:id',
  requirePermission({ permission: 'catalogs:update' }),
  validateRequest({
    params: catalogIdParamsSchema,
    body: updatePhysicalLocationSchema,
  }),
  documentCatalogController.updatePhysicalLocation,
)
documentCatalogRoutes.patch(
  '/physical-locations/:id/activate',
  requirePermission({ permission: 'catalogs:update' }),
  validateRequest({ params: catalogIdParamsSchema }),
  documentCatalogController.activatePhysicalLocation,
)
documentCatalogRoutes.patch(
  '/physical-locations/:id/deactivate',
  requirePermission({ permission: 'catalogs:update' }),
  validateRequest({ params: catalogIdParamsSchema }),
  documentCatalogController.deactivatePhysicalLocation,
)
