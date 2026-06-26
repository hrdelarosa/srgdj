import { useState } from 'react'
import { ShieldPlusIcon } from 'lucide-react'
import { createPermissionsFormSchema } from '../../schemas/permissions.schema'

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

export default function CreatePermissionsDialog() {
  const [open, setOpen] = useState(false)
  const { createPermissions } = usePermissions()
  const { register, handleSubmit, errors, reset } = useValidatedForm({
    formSchema: createPermissionsFormSchema,
    defaultValues: {
      code: '',
      name: '',
      description: '',
    },
    onSubmit: (data) => {
      console.log(data)
      createPermissions.mutate(
        { ...data, isSystem: false, isActive: true },
        {
          onSuccess: () => {
            reset({
              code: '',
              name: '',
              description: '',
            })
            setOpen(false)
          },
        },
      )
    },
  })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <ShieldPlusIcon />
          Crear permiso
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Crear usuario</DialogTitle>
          <DialogDescription>
            Complete los campos para crear un nuevo usuario.
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
            <Button type="submit">Guardar usuario</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
