import { SearchIcon } from 'lucide-react'
import type { DocumentListItem, FindAllDocumentsParams } from '@srgdj/shared'

import { Field, FieldLabel } from '@/shared/components/ui/field'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/shared/components/ui/input-group'
import { Label } from '@/shared/components/ui/label'

type DocumentsFiltersProps = {
  filters: FindAllDocumentsParams
  documents: DocumentListItem[]
  onChange: <K extends keyof FindAllDocumentsParams>(
    key: K,
    value: FindAllDocumentsParams[K],
  ) => void
}

export function DocumentsFilters({
  filters,
  documents,
  onChange,
}: DocumentsFiltersProps) {
  const statusOptions = Array.from(
    new Map(
      documents.map((doc) => [doc.currentStatus.id, doc.currentStatus]),
    ).values(),
  )

  const typeOptions = Array.from(
    new Map(
      documents.map((doc) => [doc.documentType.id, doc.documentType]),
    ).values(),
  )

  return (
    <div className="mb-4 flex flex-wrap gap-4">
      <Field className="max-w-sm min-w-[200px] flex-1">
        <FieldLabel>Buscar documentos</FieldLabel>

        <InputGroup>
          <InputGroupInput
            placeholder="Oficio, expediente, actor o demandado..."
            value={filters.query ?? ''}
            onChange={(event) => onChange('query', event.target.value)}
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
          value={filters.statusId ?? ''}
          onChange={(event) =>
            onChange('statusId', event.target.value || undefined)
          }
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
          value={filters.documentTypeId ?? ''}
          onChange={(event) =>
            onChange('documentTypeId', event.target.value || undefined)
          }
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
  )
}
