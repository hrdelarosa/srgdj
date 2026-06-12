import { Router } from 'express'

import { healthRoutes } from '../modules/health/health.routes.js'
import { documentRoutes } from '../modules/documents/document.routes.js'
import { authRoutes } from '../modules/auth/auth.routes.js'
import { userRoutes } from '../modules/users/user.routes.js'
import { roleRoutes } from '../modules/roles/role.routes.js'
import { documentCatalogRoutes } from '../modules/document-catalogs/document-catalog.routes.js'

export const apiRouter = Router()

apiRouter.use('/health', healthRoutes)
apiRouter.use('/documents', documentRoutes)
apiRouter.use('/auth', authRoutes)
apiRouter.use('/users', userRoutes)
apiRouter.use('/roles', roleRoutes)
apiRouter.use('/', documentCatalogRoutes)
