import { Link, useRoute } from 'wouter'

import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/shared/components/ui/field'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { Textarea } from '@/shared/components/ui/textarea'
import { FileCheck2Icon } from 'lucide-react'
import { useEditDocumentForm } from '@/modules/documents/hooks/useEditDocumentForm'

export function EditDocumentPage() {
  const [, params] = useRoute('/documents/:id/edit')
  const documentId = params?.id ?? ''
  const {
    register,
    handleSubmit,
    errors,
    documentQuery,
    updateMutation,
    typesQuery,
    statusesQuery,
    locationsQuery,
    documentTypeId,
    currentStatusId,
    physicalLocationId,
    handleDocumentTypeChange,
    handleStatusChange,
    handleLocationChange,
  } = useEditDocumentForm(documentId)

  if (documentQuery.isLoading) {
    return <p className="p-6">Cargando documento...</p>
  }

  if (documentQuery.isError || !documentQuery.data) {
    return <p className="p-6">No se pudo cargar el documento</p>
  }

  return (
    <>
      <div>
        <h1 className="text-2xl font-bold">Editar documento</h1>
        <p className="text-sm text-muted-foreground">
          Modifica los campos del documento según sea necesario y guarda los
          cambios. Asegúrate de que la información sea precisa antes de
          actualizar el documento.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <FieldGroup className="grid grid-cols-3 gap-3">
          <Field>
            <FieldLabel id="officeNumber">No. oficio</FieldLabel>
            <Input
              {...register('officeNumber')}
              id="officeNumber"
              type="text"
              aria-invalid={!!errors.officeNumber}
            />
            <FieldError>{errors.officeNumber?.message}</FieldError>
          </Field>

          <Field>
            <FieldLabel id="caseNumber">No. expediente</FieldLabel>
            <Input
              {...register('caseNumber')}
              id="caseNumber"
              type="text"
              aria-invalid={!!errors.caseNumber}
            />
            <FieldError>{errors.caseNumber?.message}</FieldError>
          </Field>

          <Field>
            <FieldLabel htmlFor="documentType">Tipo de documento</FieldLabel>

            <Select
              value={documentTypeId}
              onValueChange={handleDocumentTypeChange}
            >
              <SelectTrigger
                className="w-full"
                id="documentType"
                aria-invalid={!!errors.documentTypeId}
              >
                <SelectValue placeholder="Selecciona un tipo" />
              </SelectTrigger>

              <SelectContent>
                <SelectGroup>
                  {typesQuery.data?.items.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>

            <FieldError>{errors.documentTypeId?.message}</FieldError>
          </Field>
        </FieldGroup>

        <FieldGroup className="grid grid-cols-3 gap-3">
          <Field>
            <FieldLabel id="actor">Actor</FieldLabel>
            <Input
              {...register('actor')}
              id="actor"
              type="text"
              aria-invalid={!!errors.actor}
            />
            <FieldError>{errors.actor?.message}</FieldError>
          </Field>

          <Field>
            <FieldLabel id="defendant">Demandado</FieldLabel>
            <Input
              {...register('defendant')}
              id="defendant"
              type="text"
              aria-invalid={!!errors.defendant}
            />
            <FieldError>{errors.defendant?.message}</FieldError>
          </Field>

          <Field>
            <FieldLabel htmlFor="documentStatus">
              Estatus del documento
            </FieldLabel>

            <Select value={currentStatusId} onValueChange={handleStatusChange}>
              <SelectTrigger
                className="w-full"
                id="documentStatus"
                aria-invalid={!!errors.currentStatusId}
              >
                <SelectValue placeholder="Selecciona un estatus" />
              </SelectTrigger>

              <SelectContent>
                <SelectGroup>
                  {statusesQuery.data?.items.map((status) => (
                    <SelectItem key={status.id} value={status.id}>
                      {status.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>

            <FieldError>{errors.currentStatusId?.message}</FieldError>
          </Field>
        </FieldGroup>

        <FieldGroup className="grid grid-cols-3 gap-3">
          <Field id="officeDate">
            <FieldLabel>Fecha de oficio</FieldLabel>
            <Input {...register('officeDate')} id="officeDate" type="date" />
          </Field>

          <Field>
            <FieldLabel>Fecha de recibido</FieldLabel>
            <Input
              {...register('receivedDate')}
              id="receivedDate"
              type="date"
              aria-invalid={!!errors.receivedDate}
            />
            <FieldError>{errors.receivedDate?.message}</FieldError>
          </Field>

          <Field>
            <FieldLabel htmlFor="physicalLocation">Ubicación física</FieldLabel>

            <Select
              value={physicalLocationId}
              onValueChange={handleLocationChange}
            >
              <SelectTrigger
                className="w-full"
                id="physicalLocation"
                aria-invalid={!!errors.physicalLocationId}
              >
                <SelectValue placeholder="Selecciona una ubicación" />
              </SelectTrigger>

              <SelectContent>
                <SelectGroup>
                  {locationsQuery.data?.items.map((location) => (
                    <SelectItem key={location.id} value={location.id}>
                      {location.drawer
                        ? `${location.name} - ${location.drawer}`
                        : location.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>

            <FieldError>{errors.physicalLocationId?.message}</FieldError>
          </Field>
        </FieldGroup>

        <Field>
          <FieldLabel id="annexes">Anexos</FieldLabel>
          <Input {...register('annexes')} id="annexes" type="text" />
        </Field>

        <Field>
          <FieldLabel id="observations">Observaciones</FieldLabel>
          <Textarea
            className="resize-none flex-1"
            {...register('observations')}
            id="observations"
          />
        </Field>

        <div className="flex gap-2 md:col-span-2 mt-8">
          <Button type="submit" size="lg" disabled={updateMutation.isPending}>
            <FileCheck2Icon />
            {updateMutation.isPending ? 'Guardando...' : 'Guardar cambios'}
          </Button>

          <Link href={`/documents/${documentId}`}>
            <Button variant="outline" size="lg">
              Cancelar
            </Button>
          </Link>
        </div>
      </form>
    </>
  )
}
