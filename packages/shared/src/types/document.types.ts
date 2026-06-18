import type { PaginationParams } from './pagination.types.js'
import {
  CreateDocumentInput,
  UpdateDocumentInput,
} from '../schemas/document.schema.js'

export interface FindAllDocumentsParams extends PaginationParams {
  query?: string
  statusId?: string
  documentTypeId?: string
}

export type CreateDocumentModelInput = CreateDocumentInput & {
  userId: string
}

export type UpdateDocumentModelInput = UpdateDocumentInput & {
  id: string
  userId: string
}

export interface DocumentListItem {
  id: string
  officeNumber: string
  caseNumber: string | null
  actor: string | null
  defendant: string | null
  officeDate: Date | null
  receivedDate: Date
  annexes: string | null
  observations: string | null
  createdAt: Date
  updatedAt: Date
  documentType: {
    id: string
    code: string
    name: string
  }
  currentStatus: {
    id: string
    code: string
    name: string
  }
  physicalLocation: {
    id: string
    name: string
    drawer: string | null
    reference: string | null
  } | null
  createdBy: {
    id: string
    name: string
    fullName: string
  }
}

export interface PaginatedResponse<T> {
  items: T[]
  page: number
  pageSize: number
  total: number
  totalPages: number
}
