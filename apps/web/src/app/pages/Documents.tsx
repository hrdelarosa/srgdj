import { Link } from 'wouter'
import { FilePlus2Icon } from 'lucide-react'

import { Can } from '@/modules/documents/components/Can'
import { Button } from '@/shared/components/ui/button'
import { DocumentsFilters } from '@/modules/documents/components/DocumentsFilters'
import { DocumentsTable } from '@/modules/documents/components/DocumentsTable'
import { DocumentsPagination } from '@/modules/documents/components/DocumentsPagination'
import useDocumentsPage from '@/modules/documents/hooks/useDocumentsPage'

export function DocumentsPage() {
  const { filters, inputQuery, updateFilter, setPage, documentsQuery } =
    useDocumentsPage()

  if (documentsQuery.isLoading && !documentsQuery.isPlaceholderData) {
    return <p className="p-6">Cargando documentos...</p>
  }

  if (documentsQuery.isError) {
    return <p className="p-6">Error al cargar los documentos</p>
  }

  if (!documentsQuery.data) return null

  return (
    <>
      <div className="mb-2 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Listado de los Documentos</h2>
          <p className="text-sm text-muted-foreground">
            Aquí puedes gestionar tus documentos, filtrarlos por tipo o estado,
            y navegar entre las páginas de resultados.
          </p>
        </div>

        <Can permission="documents:create">
          <Link to="/documents/create">
            <Button size="lg">
              <FilePlus2Icon />
              Crear documento
            </Button>
          </Link>
        </Can>
      </div>

      <section>
        <DocumentsFilters
          filters={{ ...filters, query: inputQuery }}
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
    </>
  )
}
