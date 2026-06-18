import { useDebounced } from '@/shared/hooks/useDebounced'
import { useDocumentFilters } from './useDocumentFilters'
import { useEffect } from 'react'
import { useDocuments } from './useDocuments'

export default function useDocumentsPage() {
  const { filters, inputQuery, updateFilter, setDebouncedQuery, setPage } =
    useDocumentFilters()
  const debouncedQuery = useDebounced(inputQuery, 400)
  const documentsQuery = useDocuments({ ...filters, query: debouncedQuery })

  useEffect(() => {
    setDebouncedQuery(debouncedQuery)
  }, [debouncedQuery, setDebouncedQuery])

  return {
    filters,
    inputQuery,
    updateFilter,
    setPage,
    documentsQuery,
  }
}
