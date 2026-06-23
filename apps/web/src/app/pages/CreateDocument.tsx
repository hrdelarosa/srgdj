import { FilePlus2Icon } from 'lucide-react'
import { Link } from 'wouter'

import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Textarea } from '@/shared/components/ui/textarea'
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
import { useCreateDocumentForm } from '@/modules/documents/hooks/useCreateDocumentForm'

export function CreateDocumentPage() {
  const {
    register,
    handleSubmit,
    errors,
    createMutation,
    typesQuery,
    statusesQuery,
    documentTypeId,
    currentStatusId,
    handleDocumentTypeChange,
    handleStatusChange,
  } = useCreateDocumentForm()

  return (
    <>
      <div>
        <h1 className="text-2xl font-bold">Registrar documento</h1>
        <p className="text-sm text-muted-foreground">
          Completa el formulario para registrar un nuevo documento en el
          sistema.
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
              autoCapitalize="words"
              autoFocus
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

        <FieldGroup className="grid grid-cols-4 gap-3">
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

          <Field className="col-span-2 row-span-2">
            <FieldLabel id="observations">Observaciones</FieldLabel>
            <Textarea
              className="resize-none flex-1"
              {...register('observations')}
              id="observations"
            />
          </Field>

          <Field className="col-span-2 col-start-1">
            <FieldLabel id="annexes">Anexos</FieldLabel>
            <Input {...register('annexes')} id="annexes" type="text" />
          </Field>
        </FieldGroup>

        <div className="flex gap-2 md:col-span-2 mt-8">
          <Button type="submit" size="lg" disabled={createMutation.isPending}>
            <FilePlus2Icon />
            {createMutation.isPending ? 'Guardando...' : 'Guardar documento'}
          </Button>

          <Link href="/documents">
            <Button variant="outline" size="lg">
              Cancelar
            </Button>
          </Link>
        </div>
      </form>
    </>
  )
}
