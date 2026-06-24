import { PencilLineIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { editUserFormSchema } from '../../schemas/users.schema'

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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { useValidatedForm } from '@/shared/hooks/useValidatedForm'
import { useUsers } from '../../hooks/useUsers'
import { useRoles } from '../../hooks/useRoles'
import { Controller } from 'react-hook-form'

export default function EditUserDialog({ id }: { id: string }) {
  const [open, setOpen] = useState(false)
  const { user, updateUser } = useUsers(id)
  const { rolesQuery } = useRoles()
  const { register, handleSubmit, errors, reset, control } = useValidatedForm({
    formSchema: editUserFormSchema,
    defaultValues: {
      username: user.data?.username ?? '',
      fullName: user.data?.fullName ?? '',
      roleId: user.data?.role.id ?? '',
    },
    onSubmit: (data) => {
      console.log('data', data)
      updateUser.mutate(
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
    if (!user.data || !open) return

    reset({
      fullName: user.data.fullName ?? '',
      username: user.data.username ?? '',
      roleId: user.data.role.id ?? '',
    })
  }, [user.data, open, reset])

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
              <FieldLabel htmlFor="fullName">Nombre completo</FieldLabel>
              <Input
                {...register('fullName')}
                id="fullName"
                type="text"
                autoFocus
                aria-invalid={!!errors.fullName}
              />
              <FieldError className="text-destructive-active">
                {errors.fullName?.message}
              </FieldError>
            </Field>

            <Field className="gap-1.5">
              <FieldLabel htmlFor="username">Nombre de usuario</FieldLabel>
              <Input
                {...register('username')}
                id="username"
                type="text"
                aria-invalid={!!errors.username}
              />
              <FieldError className="text-destructive-active">
                {errors.username?.message}
              </FieldError>
            </Field>

            <Field>
              <FieldLabel htmlFor="documentType">Rol</FieldLabel>

              <Controller
                name="roleId"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value ?? ''}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger
                      className="w-full"
                      id="roleId"
                      aria-invalid={!!errors.roleId}
                    >
                      <SelectValue placeholder="Selecciona un rol" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectGroup>
                        {rolesQuery.data?.items.map((role) => (
                          <SelectItem key={role.id} value={role.id}>
                            {role.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                )}
              />

              <FieldError className="text-destructive-active">
                {errors.roleId?.message}
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
