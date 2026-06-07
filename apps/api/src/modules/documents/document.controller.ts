import type { Request, Response } from 'express'
import { DocumentService } from './document.service.js'
import { AppError } from '../../utils/errors/app-error.js'
import { DocumentModel } from './document.model.js'
import { CreateDocumentModelInput } from '@srgdj/shared'

export class DocumentController {
  private readonly documentService: DocumentService

  constructor({ documentModel }: { documentModel: typeof DocumentModel }) {
    this.documentService = new DocumentService({ documentModel })
  }

  findAll = async (req: Request, res: Response) => {
    const results = await this.documentService.findAll({
      page: req.query.page ? Number(req.query.page) : 1,
      pageSize: req.query.pageSize ? Number(req.query.pageSize) : 30,
      query: req.query.query?.toString(),
    })

    if (!results) {
      throw new AppError({
        message: 'No documents found',
        statusCode: 404,
        code: 'DOCUMENTS_NOT_FOUND',
      })
    }

    res.json(results)
  }

  findById = async (req: Request, res: Response) => {
    const id = req.params.id as string
    const document = await this.documentService.findById({ id })

    if (!document) {
      throw new AppError({
        message: 'Document not found',
        statusCode: 404,
        code: 'DOCUMENT_NOT_FOUND',
      })
    }

    res.json(document)
  }

  create = async (req: Request, res: Response) => {
    const userId = '019e9bc2-a9d6-74c9-adad-9cad76f1d9e1'
    const documentReq: CreateDocumentModelInput = req.body

    if (!userId) {
      throw new AppError({
        message: 'Unauthorized',
        statusCode: 401,
        code: 'UNAUTHORIZED',
      })
    }

    const documentExists = await this.documentService.findAll({
      query: documentReq.officeNumber,
    })

    if (documentExists.items.length > 0) {
      throw new AppError({
        message: 'Document with the same office number already exists',
        statusCode: 400,
        code: 'DOCUMENT_ALREADY_EXISTS',
      })
    }

    const document = await this.documentService.create({
      document: { ...req.body, userId },
    })

    if (!document) {
      throw new AppError({
        message: 'Failed to create document',
        statusCode: 500,
        code: 'DOCUMENT_CREATION_FAILED',
      })
    }

    res.status(201).json(document)
  }

  update = async (req: Request, res: Response) => {
    const userId = '019e9bc2-a9d6-74c9-adad-9cad76f1d9e1'

    if (!userId) {
      throw new AppError({
        message: 'Unauthorized',
        statusCode: 401,
        code: 'UNAUTHORIZED',
      })
    }

    const id = req.params.id as string
    const document = await this.documentService.update({
      id,
      document: { ...req.body, userId },
    })

    if (!document) {
      throw new AppError({
        message: 'Failed to update document',
        statusCode: 500,
        code: 'DOCUMENT_UPDATE_FAILED',
      })
    }

    res.json(document)
  }

  delete = async (req: Request, res: Response) => {
    const userId = '019e9bc2-a9d6-74c9-adad-9cad76f1d9e1'

    if (!userId) {
      throw new AppError({
        message: 'Unauthorized',
        statusCode: 401,
        code: 'UNAUTHORIZED',
      })
    }

    const id = req.params.id as string
    const deleted = await this.documentService.delete({ id, userId })

    if (!deleted) {
      throw new AppError({
        message: 'Failed to delete document',
        statusCode: 500,
        code: 'DOCUMENT_DELETION_FAILED',
      })
    }

    res.status(204).send()
  }

  remove = async (req: Request, res: Response) => {
    // TODO: Implementar la verificación de permisos para eliminar un documento,
    // solo los usuarios con permisos de administrador deberían poder eliminar
    // un documento de forma permanente

    const id = req.params.id as string
    await this.documentService.remove({ id })
    res.status(204).send()
  }
}
