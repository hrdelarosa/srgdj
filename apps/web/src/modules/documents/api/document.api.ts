import { apiClient } from '@/shared/api/api-client'
import type {
  DocumentListItem,
  FindAllDocumentsParams,
  PaginatedResponse,
} from '@srgdj/shared'

function buildDocumentsQuery(params?: FindAllDocumentsParams) {
  if (!params) return ''

  const searchParams = new URLSearchParams()

  // Mapeo de nombres del frontend a los nombres que espera el backend
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

