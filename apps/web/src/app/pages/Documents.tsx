import { useEffect } from 'react'
import { DocumentsFilters } from '@/modules/documents/components/DocumentsFilters'
import { DocumentsPagination } from '@/modules/documents/components/DocumentsPagination'
import { DocumentsTable } from '@/modules/documents/components/DocumentsTable'
import { useDocumentFilters } from '@/modules/documents/hooks/useDocumentFilters'
import { useDocuments } from '@/modules/documents/hooks/useDocuments'
import { useDebounced } from '@/shared/hooks/useDebounced'
import {
  useDocumentStatuses,
  useDocumentTypes,
} from '@/modules/documents/hooks/useDocumentCatalogs'

export function DocumentsPage() {
  const { filters, inputQuery, updateFilter, setDebouncedQuery, setPage } =
    useDocumentFilters()
  const debouncedQuery = useDebounced(inputQuery, 400)
  const typesQuery = useDocumentTypes()
  const statusesQuery = useDocumentStatuses()

  useEffect(() => {
    setDebouncedQuery(debouncedQuery)
  }, [debouncedQuery, setDebouncedQuery])

  const documentsQuery = useDocuments({ ...filters, query: debouncedQuery })

  if (documentsQuery.isLoading && !documentsQuery.isPlaceholderData) {
    return <p className="p-6">Cargando documentos...</p>
  }

  if (documentsQuery.isError) {
    return <p className="p-6">Error al cargar los documentos</p>
  }

  if (!documentsQuery.data) return null

  return (
    <section className="mt-6">
      <DocumentsFilters
        filters={{ ...filters, query: inputQuery }}
        statuses={statusesQuery.data?.items ?? []}
        types={typesQuery.data?.items ?? []}
        onChange={updateFilter}
      />

      <DocumentsTable documents={documentsQuery.data.items} />

      <DocumentsPagination
        page={documentsQuery.data.page}
        pageSize={documentsQuery.data.pageSize}
        totalItems={documentsQuery.data.total}
        totalPages={documentsQuery.data.totalPages}
        onPageChange={setPage}
      />
    </section>
  )
}
