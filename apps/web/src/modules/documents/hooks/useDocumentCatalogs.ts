import { useQuery } from '@tanstack/react-query'

import {
  getDocumentStatuses,
  getDocumentTypes,
  getPhysicalLocations,
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

export function usePhysicalLocations() {
  return useQuery({
    queryKey: ['physical-locations'],
    queryFn: getPhysicalLocations,
  })
}
