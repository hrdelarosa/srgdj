import { SearchIcon } from 'lucide-react'

import type { FindAllDocumentsParams } from '@srgdj/shared'

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
import {
  useDocumentStatuses,
  useDocumentTypes,
} from '../hooks/useDocumentCatalogs'

interface Props {
  filters: FindAllDocumentsParams
  onChange: <K extends keyof FindAllDocumentsParams>(
    key: K,
    value: FindAllDocumentsParams[K],
  ) => void
}

export function DocumentsFilters({ filters, onChange }: Props) {
  const types = useDocumentTypes()
  const statuses = useDocumentStatuses()

  return (
    <div className="flex items-center justify-between mb-5">
      <Field>
        <FieldLabel htmlFor="search-filter">Buscar documentos</FieldLabel>

        <InputGroup className="max-w-sm">
          <InputGroupInput
            id="search-filter"
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
                {statuses.data?.items.map((status) => (
                  <SelectItem key={status.id} value={status.id}>
                    {status.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>

        <Field className="w-44">
          <FieldLabel htmlFor="type-filter">Tipo</FieldLabel>

          <Select
            value={filters.documentTypeId ?? ' '}
            onValueChange={(event) =>
              onChange('documentTypeId', event === ' ' ? undefined : event)
            }
          >
            <SelectTrigger className="w-full" id="type-filter">
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              <SelectGroup>
                <SelectItem value=" ">Todos</SelectItem>
                {types.data?.items.map((type) => (
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
