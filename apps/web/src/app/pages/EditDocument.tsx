import { zodResolver } from '@hookform/resolvers/zod'
import {
  updateDocumentSchema,
  type UpdateDocumentFormInput,
  type UpdateDocumentSubmitInput,
} from '@srgdj/shared'
import { useEffect } from 'react'
import { useForm, type SubmitHandler } from 'react-hook-form'
import { Link, useRoute } from 'wouter'

import { Button } from '@/shared/components/ui/button'
import { Field, FieldError, FieldLabel } from '@/shared/components/ui/field'
import { Input } from '@/shared/components/ui/input'

import {
  useDocumentStatuses,
  useDocumentTypes,
} from '@/modules/documents/hooks/useDocumentCatalogs'
import { useDocument } from '@/modules/documents/hooks/useDocument'
import { useUpdateDocument } from '@/modules/documents/hooks/useUpdateDocument'

export function EditDocumentPage() {
  const [, params] = useRoute('/documents/:id/edit')
  const documentId = params?.id ?? ''

  const documentQuery = useDocument(documentId)
  const updateMutation = useUpdateDocument(documentId)

  const typesQuery = useDocumentTypes()
  const statusesQuery = useDocumentStatuses()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<UpdateDocumentFormInput, unknown, UpdateDocumentSubmitInput>({
    resolver: zodResolver(updateDocumentSchema),
    defaultValues: {
      officeNumber: '',
      caseNumber: '',
      actor: '',
      defendant: '',
      documentTypeId: '',
      currentStatusId: '',
      officeDate: '',
      receivedDate: '',
      annexes: '',
      observations: '',
    },
  })

  useEffect(() => {
    if (!documentQuery.data) return

    reset({
      officeNumber: documentQuery.data.officeNumber,
      caseNumber: documentQuery.data.caseNumber ?? '',
      actor: documentQuery.data.actor ?? '',
      defendant: documentQuery.data.defendant ?? '',
      documentTypeId: documentQuery.data.documentType.id,
      currentStatusId: documentQuery.data.currentStatus.id,
      officeDate: documentQuery.data.officeDate ?? '',
      receivedDate: documentQuery.data.receivedDate,
      annexes: documentQuery.data.annexes ?? '',
      observations: documentQuery.data.observations ?? '',
    })
  }, [documentQuery.data, reset])

  const onSubmit: SubmitHandler<UpdateDocumentSubmitInput> = (data) => {
    updateMutation.mutate(data)
  }

  if (documentQuery.isLoading) {
    return <p className="p-6">Cargando documento...</p>
  }

  if (documentQuery.isError || !documentQuery.data) {
    return <p className="p-6">No se pudo cargar el documento</p>
  }

  return (
    <section className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Editar documento</h1>
          <p className="text-muted-foreground">
            Modifica la información del documento.
          </p>
        </div>

        <Link href={`/documents/${documentId}`}>
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
          <FieldLabel>Estatus</FieldLabel>
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
          <Button type="submit" disabled={updateMutation.isPending}>
            {updateMutation.isPending ? 'Guardando...' : 'Guardar cambios'}
          </Button>
        </div>
      </form>
    </section>
  )
}
