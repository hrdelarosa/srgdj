import { useQuery } from '@tanstack/react-query'

import {
  getDocumentStatuses,
  getDocumentTypes,
} from '../api/document-catalog.api'

export function useDocumentTypes() {
  return useQuery({
    queryKey: ['document-types'],
    queryFn: getDocumentTypes,
  })
}

export function useDocumentStatuses() {
  return useQuery({
    queryKey: ['document-statuses'],
    queryFn: getDocumentStatuses,
  })
}
