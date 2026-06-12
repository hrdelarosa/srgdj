import { Router } from 'express'

import { DocumentCatalogController } from './document-catalog.controller.js'
import { DocumentCatalogModel } from './document-catalog.model.js'
import { requireAuth } from '../../middlewares/require-auth.js'
import { requirePermission } from '../auth/require-permission.js'

export const documentCatalogRoutes = Router()
const documentCatalogController = new DocumentCatalogController({
  documentCatalogModel: DocumentCatalogModel,
})

documentCatalogRoutes.use(requireAuth)

documentCatalogRoutes.get(
  '/document-types',
  // requirePermission({ permission: 'documents:read' }),
  documentCatalogController.findDocumentTypes,
)

documentCatalogRoutes.get(
  '/document-statuses',
  // requirePermission({ permission: 'documents:read' }),
  documentCatalogController.findDocumentStatuses,
)
