import { DocumentModel } from './document.model.js'
import {
  CreateDocumentModelInput,
  UpdateDocumentModelInput,
} from '@srgdj/shared'
import { CreateDocumentEventInput, DocumentQuery } from './document.schema.js'
import { AppError } from '../../utils/errors/app-error.js'
import { isMysqlForeignKeyError } from '../../utils/errors/mysql-errors.js'

export class DocumentService {
  private readonly documentModel: typeof DocumentModel

  constructor({ documentModel }: { documentModel: typeof DocumentModel }) {
    this.documentModel = documentModel
  }

  findAll = async (query: DocumentQuery) => {
    return this.documentModel.findAll(query)
  }

  findById = async ({ id }: { id: string }) => {
    return this.documentModel.findById({ id })
  }

  findByOfficeNumber = async ({ officeNumber }: { officeNumber: string }) => {
    return this.documentModel.findByOfficeNumber({ officeNumber })
  }

  create = async ({ document }: { document: CreateDocumentModelInput }) => {
    try {
      return await this.documentModel.create({ document })
    } catch (error) {
      this.throwInvalidDocumentReference(error)
    }
  }

  update = async ({
    id,
    document,
  }: {
    id: string
    document: UpdateDocumentModelInput
  }) => {
    try {
      return await this.documentModel.update({ id, document })
    } catch (error) {
      this.throwInvalidDocumentReference(error)
    }
  }

  delete = async ({ id, userId }: { id: string; userId: string }) => {
    return this.documentModel.delete({ id, userId })
  }

  remove = async ({ id }: { id: string }) => {
    return await this.documentModel.remove({ id })
  }

  findEventsByDocumentId = async ({ id }: { id: string }) => {
    return this.documentModel.findEventsByDocumentId({ id })
  }

  createEvent = async ({
    id,
    data,
    userId,
  }: {
    id: string
    data: CreateDocumentEventInput
    userId: string
  }) => {
    try {
      return await this.documentModel.createEvent({ id, data, userId })
    } catch (error) {
      this.throwInvalidDocumentReference(error)
    }
  }

  private throwInvalidDocumentReference(error: unknown): never {
    if (isMysqlForeignKeyError(error)) {
      throw new AppError({
        message:
          'El documento referencia un tipo, estatus, ubicación o usuario inexistente',
        statusCode: 400,
        code: 'INVALID_DOCUMENT_REFERENCE',
      })
    }

    throw error
  }
}
