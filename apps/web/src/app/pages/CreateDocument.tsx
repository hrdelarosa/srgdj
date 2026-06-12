import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, type SubmitHandler } from 'react-hook-form'
import { Link } from 'wouter'
import {
  createDocumentSchema,
  type CreateDocumentFormInput,
  type CreateDocumentInput,
} from '@srgdj/shared'

import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Field, FieldError, FieldLabel } from '@/shared/components/ui/field'
import {
  useDocumentStatuses,
  useDocumentTypes,
} from '@/modules/documents/hooks/useDocumentCatalogs'
import { useCreateDocument } from '@/modules/documents/hooks/useCreateDocument'

export function CreateDocumentPage() {
  const createMutation = useCreateDocument()
  const typesQuery = useDocumentTypes()
  const statusesQuery = useDocumentStatuses()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateDocumentFormInput, unknown, CreateDocumentInput>({
    resolver: zodResolver(createDocumentSchema),
    defaultValues: {
      officeNumber: '',
      caseNumber: '',
      actor: '',
      defendant: '',
      documentTypeId: '',
      officeDate: '',
      receivedDate: '',
      annexes: '',
      physicalLocationId: undefined,
      currentStatusId: '',
      observations: '',
    },
  })

  const onSubmit: SubmitHandler<CreateDocumentInput> = (
    data: CreateDocumentInput,
  ) => {
    createMutation.mutate({ data })
  }

  return (
    <section className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Registrar documento</h1>
          <p className="text-muted-foreground">
            Captura la información general del documento.
          </p>
        </div>

        <Link href="/documents">
          <Button variant="outline">Cancelar</Button>
        </Link>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid gap-4 md:grid-cols-2"
      >
        <Field>
          <FieldLabel>No. oficio</FieldLabel>
          <Input {...register('officeNumber')} />
          <FieldError>{errors.officeNumber?.message}</FieldError>
        </Field>

        <Field>
          <FieldLabel>No. expediente</FieldLabel>
          <Input {...register('caseNumber')} />
          <FieldError>{errors.caseNumber?.message}</FieldError>
        </Field>

        <Field>
          <FieldLabel>Actor</FieldLabel>
          <Input {...register('actor')} />
          <FieldError>{errors.actor?.message}</FieldError>
        </Field>

        <Field>
          <FieldLabel>Demandado</FieldLabel>
          <Input {...register('defendant')} />
          <FieldError>{errors.defendant?.message}</FieldError>
        </Field>

        <Field>
          <FieldLabel>Tipo de documento</FieldLabel>
          <select
            className="border-input bg-background h-9 rounded-md border px-3 text-sm"
            {...register('documentTypeId')}
          >
            <option value="">Selecciona un tipo</option>
            {typesQuery.data?.items.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>
          <FieldError>{errors.documentTypeId?.message}</FieldError>
        </Field>

        <Field>
          <FieldLabel>Estatus inicial</FieldLabel>
          <select
            className="border-input bg-background h-9 rounded-md border px-3 text-sm"
            {...register('currentStatusId')}
          >
            <option value="">Selecciona un estatus</option>
            {statusesQuery.data?.items.map((status) => (
              <option key={status.id} value={status.id}>
                {status.name}
              </option>
            ))}
          </select>
          <FieldError>{errors.currentStatusId?.message}</FieldError>
        </Field>

        <Field>
          <FieldLabel>Fecha de oficio</FieldLabel>
          <Input type="date" {...register('officeDate')} />
        </Field>

        <Field>
          <FieldLabel>Fecha de recibido</FieldLabel>
          <Input type="date" {...register('receivedDate')} />
          <FieldError>{errors.receivedDate?.message}</FieldError>
        </Field>

        <Field className="md:col-span-2">
          <FieldLabel>Anexos</FieldLabel>
          <Input {...register('annexes')} />
        </Field>

        <Field className="md:col-span-2">
          <FieldLabel>Observaciones</FieldLabel>
          <Input {...register('observations')} />
        </Field>

        <div className="flex gap-2 md:col-span-2">
          <Button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? 'Guardando...' : 'Guardar documento'}
          </Button>
        </div>
      </form>
    </section>
  )
}
