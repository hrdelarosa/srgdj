import { DocumentModel } from './document.model.js'
import {
  FindAllDocumentsParams,
  CreateDocumentModelInput,
  UpdateDocumentModelInput,
} from '@srgdj/shared'

export class DocumentService {
  private readonly documentModel: typeof DocumentModel

  constructor({ documentModel }: { documentModel: typeof DocumentModel }) {
    this.documentModel = documentModel
  }

  findAll = async ({
    page,
    pageSize,
    query,
    statusId,
    documentTypeId,
  }: FindAllDocumentsParams) => {
    return this.documentModel.findAll({
      page,
      pageSize,
      query,
      statusId,
      documentTypeId,
    })
  }

  findById = async ({ id }: { id: string }) => {
    return this.documentModel.findById({ id })
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
}

// import { documentRepository } from './document.repository.js'

// type FindAllDocumentsParams = {
//   q?: string
//   page?: number
//   pageSize?: number
// }

// export const documentService = {
//   async findAll({ params }: { params: FindAllDocumentsParams }) {
//     return documentRepository.findAll({ params })
//   },

//   async findById({ id }: { id: string }) {
//     return documentRepository.findById({ id })
//   },

//   async create(data: unknown) {
//     return documentRepository.create(data)
//   },

//   async update(id: number, data: unknown) {
//     return documentRepository.update(id, data)
//   },

//   async remove(id: number) {
//     return documentRepository.remove(id)
//   },
// }
