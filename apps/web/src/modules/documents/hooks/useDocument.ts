import { useQuery } from '@tanstack/react-query'

import { getDocumentById } from '../api/document.api'

export function useDocument(id: string) {
  return useQuery({
    queryKey: ['documents', id],
    queryFn: () => getDocumentById(id),
    enabled: Boolean(id),
  })
}
