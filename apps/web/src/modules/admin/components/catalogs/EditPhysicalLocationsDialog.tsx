import { useEffect, useState } from 'react'
import { PencilLineIcon } from 'lucide-react'
import { editPhysicalLocationsFormSchema } from '../../schemas/catalogs.schema'

import { Input } from '@/shared/components/ui/input'
import { Button } from '@/shared/components/ui/button'
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

export default function EditPhysicalLocationsDialog({ id }: { id: string }) {
  const [open, setOpen] = useState(false)
  const { catalog, updateCatalog } = useCatalogs('physical-locations', id)
  const { register, handleSubmit, errors, reset } = useValidatedForm({
    formSchema: editPhysicalLocationsFormSchema,
    defaultValues: {
      name: catalog.data?.name ?? '',
      drawer: catalog.data?.drawer ?? '',
      reference: catalog.data?.reference ?? '',
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
      name: catalog.data?.name ?? '',
      drawer: catalog.data?.drawer ?? '',
      reference: catalog.data?.reference ?? '',
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
          <DialogTitle>Editar ubicación física</DialogTitle>
          <DialogDescription>
            Modifica los datos de la ubicación física.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <FieldGroup className="gap-3.5">
            <Field className="gap-1.5">
              <FieldLabel htmlFor="name">Nombre</FieldLabel>
              <Input
                {...register('name')}
                id="name"
                type="text"
                autoFocus
                aria-invalid={!!errors.name}
              />
              <FieldError className="text-destructive-active">
                {errors.name?.message}
              </FieldError>
            </Field>

            <Field className="gap-1.5">
              <FieldLabel htmlFor="drawer">Gaveta</FieldLabel>
              <Input
                {...register('drawer')}
                id="drawer"
                type="text"
                aria-invalid={!!errors.drawer}
              />
              <FieldError className="text-destructive-active">
                {errors.drawer?.message}
              </FieldError>
            </Field>

            <Field className="gap-1.5">
              <FieldLabel htmlFor="reference">Referencia</FieldLabel>
              <Input
                {...register('reference')}
                id="reference"
                type="text"
                aria-invalid={!!errors.reference}
              />
              <FieldError className="text-destructive-active">
                {errors.reference?.message}
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
