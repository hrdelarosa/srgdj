import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table'
import { useDocuments } from '../hooks/useDocuments'
import { formatDate } from '@/shared/lib/formatDate'
import { Button } from '@/shared/components/ui/button'
import {
  Trash,
  PencilLine,
  Eye,
  MoreHorizontal,
  SearchIcon,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu'
import { Field, FieldLabel } from '@/shared/components/ui/field'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/shared/components/ui/input-group'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/shared/components/ui/pagination'
import { Label } from '@/shared/components/ui/label'
import { usePagination } from '@/shared/hooks/usePagination'

const PAGE_SIZE = 10

export default function TableDocuments() {
  const [page, setPage] = useState(1)
  const [query, setQuery] = useState('')
  const [statusId, setStatusId] = useState<string>()
  const [documentTypeId, setDocumentTypeId] = useState<string>()

  const { data, isLoading, isError } = useDocuments({
    page,
    pageSize: PAGE_SIZE,
    query: query || undefined,
    statusId,
    documentTypeId,
  })
  const {} = usePagination({})

  const statusOptions = Array.from(
    new Map(
      data?.items.map((doc) => [doc.currentStatus.id, doc.currentStatus]) ?? [],
    ).values(),
  )

  const typeOptions = Array.from(
    new Map(
      data?.items.map((doc) => [doc.documentType.id, doc.documentType]) ?? [],
    ).values(),
  )

  if (isLoading) return <p className="p-6">Cargando documentos...</p>
  if (isError) return <p className="p-6">Error al cargar los documentos</p>
  if (!data) return null

  const handleSearchChange = (value: string) => {
    setQuery(value)
    setPage(1)
  }

  const handleStatusChange = (value: string) => {
    setStatusId(value || undefined)
    setPage(1)
  }

  const handleTypeChange = (value: string) => {
    setDocumentTypeId(value || undefined)
    setPage(1)
  }

  return (
    <div className="mt-6">
      <div className="mb-4 flex flex-wrap gap-4">
        <Field className="max-w-sm min-w-[200px] flex-1">
          <FieldLabel>Buscar documentos</FieldLabel>
          <InputGroup>
            <InputGroupInput
              placeholder="Oficio, expediente, actor o demandado..."
              value={query}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
            <InputGroupAddon align="inline-start">
              <SearchIcon className="text-muted-foreground" />
            </InputGroupAddon>
          </InputGroup>
        </Field>

        <div className="min-w-[160px]">
          <Label htmlFor="status-filter" className="mb-2 block">
            Estatus
          </Label>
          <select
            id="status-filter"
            className="border-input bg-background h-9 w-full rounded-md border px-3 text-sm"
            value={statusId ?? ''}
            onChange={(e) => handleStatusChange(e.target.value)}
          >
            <option value="">Todos</option>
            {statusOptions.map((status) => (
              <option key={status.id} value={status.id}>
                {status.name}
              </option>
            ))}
          </select>
        </div>

        <div className="min-w-[160px]">
          <Label htmlFor="type-filter" className="mb-2 block">
            Tipo
          </Label>
          <select
            id="type-filter"
            className="border-input bg-background h-9 w-full rounded-md border px-3 text-sm"
            value={documentTypeId ?? ''}
            onChange={(e) => handleTypeChange(e.target.value)}
          >
            <option value="">Todos</option>
            {typeOptions.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader className="bg-gray-100">
            <TableRow>
              <TableHead>No. Oficio</TableHead>
              <TableHead>Expediente</TableHead>
              <TableHead>Actor</TableHead>
              <TableHead>Demandado</TableHead>
              <TableHead>Fecha del oficio</TableHead>
              <TableHead>Fecha de recibido</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Estatus</TableHead>
              <TableHead className="text-right w-8"></TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {data.items.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className="text-center text-muted-foreground"
                >
                  No se encontraron documentos
                </TableCell>
              </TableRow>
            ) : (
              data.items.map((document) => (
                <TableRow key={document.id}>
                  <TableCell className="font-medium">
                    {document.officeNumber}
                  </TableCell>
                  <TableCell>{document.caseNumber}</TableCell>
                  <TableCell>{document.actor}</TableCell>
                  <TableCell>{document.defendant}</TableCell>
                  <TableCell>{formatDate(document.officeDate)}</TableCell>
                  <TableCell>{formatDate(document.receivedDate)}</TableCell>
                  <TableCell>{document.documentType.name}</TableCell>
                  <TableCell>{document.currentStatus.name}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon-sm">
                          <span className="sr-only">Open Menu</span>
                          <MoreHorizontal />
                        </Button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                        <DropdownMenuGroup>
                          <DropdownMenuItem>
                            <Eye />
                            Detalles
                          </DropdownMenuItem>

                          <DropdownMenuItem>
                            <PencilLine />
                            Editar
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                          <DropdownMenuItem variant="destructive">
                            <Trash />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="w-full flex items-end justify-between mt-7">
        <span className="font-semibold text-gray-700">
          Resultados: {startItem}-{endItem} de {totalItems}
        </span>

        <div className="flex items-center justify-center gap-1">
          <Button
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
            className="hover:bg-gray-200"
          >
            <ChevronLeft className="size-4" />
          </Button>

          {paginationItems.map((pageNumber) => {
            if (pageNumber === -1 || pageNumber === -2) {
              return (
                <span
                  key={pageNumber}
                  className="flex items-center justify-center text-sm p-2"
                >
                  <Ellipsis className="size-4" />
                </span>
              )
            }
            return (
              <Button
                key={pageNumber}
                onClick={() => handlePageChange(pageNumber)}
                className={
                  pageNumber === page
                    ? 'bg-primary-yellow text-black border-primary-yellow hover:bg-black hover:text-primary-yellow hover:border-black'
                    : 'hover:bg-gray-100 hover:border-gray-100'
                }
              >
                {pageNumber}
              </Button>
            )
          })}

          <Button
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages}
            className="hover:bg-gray-200"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
