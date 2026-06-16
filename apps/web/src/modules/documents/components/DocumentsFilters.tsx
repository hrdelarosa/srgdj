import { SearchIcon } from 'lucide-react'

import type { FindAllDocumentsParams } from '@srgdj/shared'
import type {
  DocumentStatusOption,
  DocumentTypeOption,
} from '../types/document-catalog.types'

import { Field, FieldLabel } from '@/shared/components/ui/field'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/shared/components/ui/input-group'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'

interface Props {
  filters: FindAllDocumentsParams
  statuses: DocumentStatusOption[]
  types: DocumentTypeOption[]
  onChange: <K extends keyof FindAllDocumentsParams>(
    key: K,
    value: FindAllDocumentsParams[K],
  ) => void
}

export function DocumentsFilters({
  filters,
  statuses,
  types,
  onChange,
}: Props) {
  return (
    <div className="flex items-center justify-between mb-5">
      <Field>
        <FieldLabel>Buscar documentos</FieldLabel>

        <InputGroup className="max-w-sm">
          <InputGroupInput
            placeholder="Oficio, expediente, actor o demandado..."
            value={filters.query ?? ''}
            onChange={(event) => onChange('query', event.target.value)}
          />
          <InputGroupAddon align="inline-start">
            <SearchIcon />
          </InputGroupAddon>
        </InputGroup>
      </Field>

      <div className="flex gap-4">
        <Field className="w-44">
          <FieldLabel htmlFor="status-filter">Estatus</FieldLabel>

          <Select
            value={filters.statusId ?? ' '}
            onValueChange={(event) =>
              onChange('statusId', event === ' ' ? undefined : event)
            }
          >
            <SelectTrigger className="w-full" id="status-filter">
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              <SelectGroup>
                <SelectItem value=" ">Todos</SelectItem>
                {statuses.map((status) => (
                  <SelectItem key={status.id} value={status.id}>
                    {status.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>

        <Field className="w-44">
          <FieldLabel>Tipo</FieldLabel>

          <Select
            value={filters.documentTypeId ?? ' '}
            onValueChange={(event) =>
              onChange('documentTypeId', event === ' ' ? undefined : event)
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              <SelectGroup>
                <SelectItem value=" ">Todos</SelectItem>
                {types.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>
      </div>
    </div>
  )
}
