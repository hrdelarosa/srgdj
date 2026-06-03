import { Router } from 'express'
import { documentController } from './document.controller.js'

export const documentRoutes = Router()

documentRoutes.get('/', documentController.findAll)
documentRoutes.get('/:id', documentController.findById)
documentRoutes.post('/', documentController.create)
documentRoutes.patch('/:id', documentController.update)
documentRoutes.delete('/:id', documentController.remove)
