import { httpClient } from '@/shared/api/http-client'
import type {
  DocumentListItem,
  FindAllDocumentsParams,
  PaginatedResponse,
} from '@srgdj/shared'

function buildDocumentsQuery(params?: FindAllDocumentsParams) {
  if (!params) return ''

  const searchParams = new URLSearchParams()

  if (params.page !== undefined) searchParams.set('page', String(params.page))
  if (params.pageSize !== undefined)
    searchParams.set('pageSize', String(params.pageSize))
  if (params.query) searchParams.set('query', params.query)
  if (params.statusId) searchParams.set('statusId', params.statusId)
  if (params.documentTypeId)
    searchParams.set('documentTypeId', params.documentTypeId)

  const query = searchParams.toString()
  return query ? `?${query}` : ''
}

export function getDocuments(params?: FindAllDocumentsParams) {
  return httpClient<PaginatedResponse<DocumentListItem>>(
    `/documents${buildDocumentsQuery(params)}`,
  )
}
