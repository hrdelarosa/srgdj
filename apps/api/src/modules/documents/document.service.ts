import { DocumentModel } from './document.model.js'
import {
  CreateDocumentModelInput,
  UpdateDocumentModelInput,
} from '@srgdj/shared'
import { CreateDocumentEventInput, DocumentQuery } from './document.schema.js'

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
    return this.documentModel.create({ document })
  }

  update = async ({
    id,
    document,
  }: {
    id: string
    document: UpdateDocumentModelInput
  }) => {
    return this.documentModel.update({ id, document })
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
    return this.documentModel.createEvent({ id, data, userId })
  }
}
