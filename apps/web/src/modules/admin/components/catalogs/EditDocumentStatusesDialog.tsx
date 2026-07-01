import { useEffect, useState } from 'react'
import { PencilLineIcon } from 'lucide-react'
import { editDocumentStatusesFormSchema } from '../../schemas/catalogs.schema'

import { Input } from '@/shared/components/ui/input'
import { Button } from '@/shared/components/ui/button'
import { Textarea } from '@/shared/components/ui/textarea'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/shared/components/ui/field'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/components/ui/dialog'
import { useValidatedForm } from '@/shared/hooks/useValidatedForm'
import { useCatalogs } from '../../hooks/useCatalogs'

export default function EditDocumentStatusesDialog({ id }: { id: string }) {
  const [open, setOpen] = useState(false)
  const { catalog, updateCatalog } = useCatalogs('document-statuses', id)
  const { register, handleSubmit, errors, reset } = useValidatedForm({
    formSchema: editDocumentStatusesFormSchema,
    defaultValues: {
      code: catalog.data?.code ?? '',
      name: catalog.data?.name ?? '',
      description: catalog.data?.description ?? '',
      sortOrder: catalog.data?.sortOrder ?? 0,
      isTerminal: catalog.data?.isTerminal ?? false,
      isActive: catalog.data?.isActive ?? false,
    },
    onSubmit: (data) => {
      updateCatalog.mutate(
        { id, data },
        {
          onSuccess: () => {
            setOpen(false)
          },
        },
      )
    },
  })

  useEffect(() => {
    if (!catalog.data || !open) return

    reset({
      code: catalog.data?.code ?? '',
      name: catalog.data?.name ?? '',
      description: catalog.data?.description ?? '',
      sortOrder: catalog.data?.sortOrder ?? 0,
      isTerminal: catalog.data?.isTerminal ?? false,
      isActive: catalog.data?.isActive ?? false,
    })
  }, [catalog.data, open, reset])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="cursor-pointer">
          <PencilLineIcon />
          Editar
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Editar estado de documento</DialogTitle>
          <DialogDescription>
            Modifica los datos del estado de documento.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <FieldGroup className="gap-3.5">
            <Field className="gap-1.5">
              <FieldLabel htmlFor="code">Código</FieldLabel>
              <Input
                {...register('code')}
                id="code"
                type="text"
                autoFocus
                aria-invalid={!!errors.code}
              />
              <FieldError className="text-destructive-active">
                {errors.code?.message}
              </FieldError>
            </Field>

            <Field className="gap-1.5">
              <FieldLabel htmlFor="name">Nombre</FieldLabel>
              <Input
                {...register('name')}
                id="name"
                type="text"
                aria-invalid={!!errors.name}
              />
              <FieldError className="text-destructive-active">
                {errors.name?.message}
              </FieldError>
            </Field>

            <Field className="gap-1.5">
              <FieldLabel htmlFor="sortOrder">Orden</FieldLabel>
              <Input
                {...register('sortOrder')}
                id="sortOrder"
                type="number"
                aria-invalid={!!errors.sortOrder}
              />
              <FieldError className="text-destructive-active">
                {errors.sortOrder?.message}
              </FieldError>
            </Field>

            <Field className="gap-1.5">
              <FieldLabel htmlFor="description">Descripción</FieldLabel>
              <Textarea
                {...register('description')}
                id="description"
                aria-invalid={!!errors.description}
                className="resize-none"
              />
              <FieldError className="text-destructive-active">
                {errors.description?.message}
              </FieldError>
            </Field>
          </FieldGroup>

          <DialogFooter className="mt-4">
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button type="submit">Guardar cambios</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
