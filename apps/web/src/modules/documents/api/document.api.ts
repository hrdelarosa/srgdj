import { apiClient } from '@/shared/api/api-client'
import type {
  DocumentListItem,
  FindAllDocumentsParams,
  PaginatedResponse,
} from '@srgdj/shared'
import type { DocumentDetail } from '../types/document.types'

function buildDocumentsQuery(params?: FindAllDocumentsParams) {
  if (!params) return ''

  const searchParams = new URLSearchParams()

  const { query, statusId, documentTypeId, ...rest } = params

  if (query) searchParams.set('q', query)
  if (statusId) searchParams.set('currentStatusId', statusId)
  if (documentTypeId) searchParams.set('documentTypeId', documentTypeId)

  Object.entries(rest).forEach(([key, value]) => {
    if (value !== undefined && value !== null)
      searchParams.set(key, String(value))
  })

  const queryString = searchParams.toString()

  return queryString ? `?${queryString}` : ''
}

export function getDocuments(params?: FindAllDocumentsParams) {
  return apiClient<PaginatedResponse<DocumentListItem>>(
    `/documents${buildDocumentsQuery(params)}`,
  )
}

export function getDocumentById(id: string) {
  return apiClient<DocumentDetail>(`/documents/${id}`)
}
