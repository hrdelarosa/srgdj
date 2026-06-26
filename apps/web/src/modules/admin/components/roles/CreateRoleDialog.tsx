import { useState } from 'react'
import { PlusIcon } from 'lucide-react'
import { createRoleFormSchema } from '../../schemas/roles.shcema'

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
import { useRoles } from '../../hooks/useRoles'

export default function CreateRoleDialog() {
  const [open, setOpen] = useState(false)
  const { createRole } = useRoles()
  const { register, handleSubmit, errors, reset } = useValidatedForm({
    formSchema: createRoleFormSchema,
    defaultValues: {
      code: '',
      name: '',
      description: '',
    },
    onSubmit: (data) => {
      createRole.mutate(
        { ...data, code: data.code.toUpperCase(), isActive: true },
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
          <PlusIcon />
          Crear Rol
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Crear un rol</DialogTitle>
          <DialogDescription>
            Complete los campos para crear un nuevo rol.
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
                className="uppercase"
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
            <Button type="submit">Guardar rol</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
