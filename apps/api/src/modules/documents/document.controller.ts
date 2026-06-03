import type { Request, Response } from 'express'
import { documentService } from './document.service.js'
import { AppError } from '../../utils/errors/app-error.js'

export const documentController = {
  async findAll(req: Request, res: Response) {
    const documents = await documentService.findAll()

    res.json({
      items: documents,
    })
  },

  async findById(req: Request, res: Response) {
    const document = await documentService.findById(Number(req.params.id))

    if (!document) {
      throw new AppError({
        message: 'Document not found',
        statusCode: 404,
        code: 'DOCUMENT_NOT_FOUND',
      })
    }

    return res.json(document)
  },

  async create(req: Request, res: Response) {
    const document = await documentService.create(req.body)

    return res.status(201).json(document)
  },

  async update(req: Request, res: Response) {
    const document = await documentService.update(
      Number(req.params.id),
      req.body,
    )

    if (!document) {
      throw new AppError({
        message: 'Document not found',
        statusCode: 404,
        code: 'DOCUMENT_NOT_FOUND',
      })
    }

    return res.json(document)
  },

  async remove(req: Request, res: Response) {
    await documentService.remove(Number(req.params.id))

    return res.status(204).send()
  },
}
