import { useEffect, useState } from 'react'
import { PencilLineIcon } from 'lucide-react'
import { editPermissionsFormSchema } from '../../schemas/permissions.schema'

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
import { usePermissions } from '../../hooks/usePermissions'

export default function EditPermissionsDialog({ id }: { id: string }) {
  const [open, setOpen] = useState(false)
  const { permission, updatePermissions } = usePermissions(id)
  const { register, handleSubmit, errors, reset } = useValidatedForm({
    formSchema: editPermissionsFormSchema,
    defaultValues: {
      code: permission.data?.code ?? '',
      name: permission.data?.name ?? '',
      description: permission.data?.description ?? '',
    },
    onSubmit: (data) => {
      updatePermissions.mutate(
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
    if (!permission.data || !open) return

    reset({
      code: permission.data.code ?? '',
      name: permission.data.name ?? '',
      description: permission.data.description ?? '',
    })
  }, [permission.data, open, reset])

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
          <DialogTitle>Editar usuario</DialogTitle>
          <DialogDescription>Modifica los datos del usuario.</DialogDescription>
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
              <FieldLabel htmlFor="description">Descripción</FieldLabel>
              <Textarea
                {...register('description')}
                id="description"
                className="resize-none"
                aria-invalid={!!errors.description}
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
