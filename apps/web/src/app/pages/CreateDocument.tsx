import { FilePlus2Icon } from 'lucide-react'
import { useEffect } from 'react'
import { Link } from 'wouter'
import { createDocumentSchema } from '@srgdj/shared'

import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Textarea } from '@/shared/components/ui/textarea'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/shared/components/ui/field'
import { useCreateDocument } from '@/modules/documents/hooks/useCreateDocument'
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
} from '@/modules/documents/hooks/useDocumentCatalogs'
import { useValidatedForm } from '@/shared/hooks/useValidatedForm'
import { Controller } from 'react-hook-form'

export function CreateDocumentPage() {
  const createMutation = useCreateDocument()
  const types = useDocumentTypes()
  const statuses = useDocumentStatuses()
  const { register, handleSubmit, errors, control, setValue, watch } =
    useValidatedForm({
      formSchema: createDocumentSchema,
      onSubmit: (data) => createMutation.mutate({ data }),
      defaultValues: {
        officeNumber: '',
        caseNumber: '',
        actor: '',
        defendant: '',
        documentTypeId: '',
        annexes: '',
        physicalLocationId: undefined,
        currentStatusId: '',
        observations: '',
      },
    })

  useEffect(() => {
    const firstTypeId = types.data?.items[0]?.id
    const lastStatusId = statuses.data?.items.at(-1)?.id

    if (firstTypeId && !watch('documentTypeId')) {
      setValue('documentTypeId', firstTypeId)
    }

    if (lastStatusId && !watch('currentStatusId')) {
      setValue('currentStatusId', lastStatusId)
    }
  }, [types.data, statuses.data, setValue, watch])

  return (
    <>
      <div>
        <h2 className="text-2xl font-bold">Registrar documento</h2>
        <p className="text-sm text-muted-foreground">
          Completa el formulario para registrar un nuevo documento en el
          sistema.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <FieldGroup className="grid grid-cols-3 gap-3">
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
            <FieldLabel htmlFor="documentType">Tipo de documento</FieldLabel>

            <Controller
              name="documentTypeId"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full" id="documentType">
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectGroup>
                      {types.data?.items.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              )}
            />

            <FieldError>{errors.documentTypeId?.message}</FieldError>
          </Field>
        </FieldGroup>

        <FieldGroup className="grid grid-cols-3 gap-3">
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
            <FieldLabel htmlFor="documentStatus">
              Estatus del documento
            </FieldLabel>

            <Controller
              name="currentStatusId"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full" id="documentStatus">
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectGroup>
                      {statuses.data?.items.map((status) => (
                        <SelectItem key={status.id} value={status.id}>
                          {status.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              )}
            />
          </Field>
        </FieldGroup>

        <FieldGroup className="grid grid-cols-4 gap-3">
          <Field>
            <FieldLabel>Fecha de oficio</FieldLabel>
            <Input type="date" {...register('officeDate')} />
          </Field>

          <Field>
            <FieldLabel>Fecha de recibido</FieldLabel>
            <Input type="date" {...register('receivedDate')} />
            <FieldError>{errors.receivedDate?.message}</FieldError>
          </Field>

          <Field className="col-span-2 row-span-2">
            <FieldLabel>Observaciones</FieldLabel>
            <Textarea
              className="resize-none flex-1"
              {...register('observations')}
            />
          </Field>

          <Field className="col-span-2 col-start-1">
            <FieldLabel>Anexos</FieldLabel>
            <Input {...register('annexes')} />
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
