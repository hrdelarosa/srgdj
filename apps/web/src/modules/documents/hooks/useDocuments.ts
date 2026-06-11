import { useQuery } from '@tanstack/react-query'
import type { FindAllDocumentsParams } from '@srgdj/shared'
import { getDocuments } from '../api/document.api'

export function useDocuments(params?: FindAllDocumentsParams) {
  return useQuery({
    queryKey: ['documents', params],
    queryFn: () => getDocuments(params),
  })
}
