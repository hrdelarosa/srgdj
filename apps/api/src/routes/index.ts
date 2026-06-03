import { Router } from 'express'

import { healthRoutes } from '../modules/health/health.routes.js'
import { documentRoutes } from '../modules/documents/document.routes.js'

export const apiRouter = Router()

apiRouter.use('/health', healthRoutes)
apiRouter.use('/documents', documentRoutes)
