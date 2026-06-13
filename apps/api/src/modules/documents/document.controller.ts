import type { Request, Response } from 'express'
import { DocumentService } from './document.service.js'
import { AppError } from '../../utils/errors/app-error.js'
import { DocumentModel } from './document.model.js'
import { CreateDocumentModelInput } from '@srgdj/shared'
import { DocumentQuery } from './document.schema.js'
import { AuditService } from '../audit/audit.service.js'

export class DocumentController {
  private readonly documentService: DocumentService

  constructor({ documentModel }: { documentModel: typeof DocumentModel }) {
    this.documentService = new DocumentService({ documentModel })
  }

  findAll = async (req: Request, res: Response) => {
    const query = req.query as unknown as DocumentQuery
    const results = await this.documentService.findAll(query)

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
    const userId = req.user?.id
    const documentReq: CreateDocumentModelInput = req.body

    if (!userId) {
      throw new AppError({
        message: 'Unauthorized',
        statusCode: 401,
        code: 'UNAUTHORIZED',
      })
    }

    const documentExists = await this.documentService.findByOfficeNumber({
      officeNumber: documentReq.officeNumber,
    })

    if (documentExists) {
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

    await AuditService.create({
      data: {
        actorUserId: userId,
        action: 'documents.create',
        entityType: 'document',
        entityId: document.id,
      },
    })

    res.status(201).json(document)
  }

  update = async (req: Request, res: Response) => {
    const userId = req.user?.id as string

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

    await AuditService.create({
      data: {
        actorUserId: userId,
        action: 'documents.update',
        entityType: 'document',
        entityId: document.id,
      },
    })

    res.json(document)
  }

  delete = async (req: Request, res: Response) => {
    const userId = req.user?.id as string

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

    await AuditService.create({
      data: {
        actorUserId: userId,
        action: 'documents.delete',
        entityType: 'document',
        entityId: id,
      },
    })

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

  findEventsByDocumentId = async (req: Request, res: Response) => {
    const id = req.params.id as string
    const events = await this.documentService.findEventsByDocumentId({ id })

    res.json({
      items: events,
    })
  }

  createEvent = async (req: Request, res: Response) => {
    const userId = req.user?.id
    const id = req.params.id as string

    if (!userId) {
      throw new AppError({
        message: 'Unauthorized',
        statusCode: 401,
        code: 'UNAUTHORIZED',
      })
    }

    const event = await this.documentService.createEvent({
      id,
      data: req.body,
      userId,
    })

    if (!event) {
      throw new AppError({
        message: 'Document not found',
        statusCode: 404,
        code: 'DOCUMENT_NOT_FOUND',
      })
    }

    await AuditService.create({
      data: {
        actorUserId: userId,
        action: 'documents.events.create',
        entityType: 'document',
        entityId: id,
        metadata: { eventType: req.body.eventType },
      },
    })

    res.status(201).json(event)
  }
}
