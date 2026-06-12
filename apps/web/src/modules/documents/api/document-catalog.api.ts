import { apiClient } from '@/shared/api/api-client'
import type {
  CatalogResponse,
  DocumentStatusOption,
  DocumentTypeOption,
} from '../types/document-catalog.types'

export async function getDocumentTypes() {
  return apiClient<CatalogResponse<DocumentTypeOption>>('/document-types')
}

export async function getDocumentStatuses() {
  return apiClient<CatalogResponse<DocumentStatusOption>>('/document-statuses')
}
