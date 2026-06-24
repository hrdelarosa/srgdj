import { UserPlusIcon } from 'lucide-react'
import { useState } from 'react'
import { createUserFormSchema } from '../../schemas/users.schema'

import PasswordInput from '@/modules/auth/components/password-input'
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
import { Input } from '@/shared/components/ui/input'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { useValidatedForm } from '@/shared/hooks/useValidatedForm'
import { useUsers } from '../hooks/useUsers'
import { useRoles } from '../hooks/useRoles'

export default function CreateUserDialog() {
  const [open, setOpen] = useState(false)
  const [selectedRoleId, setSelectedRoleId] = useState('')
  const { createUser } = useUsers()
  const { roles } = useRoles()
  const { register, handleSubmit, errors, setValue, reset } = useValidatedForm({
    formSchema: createUserFormSchema,
    defaultValues: {
      username: '',
      fullName: '',
      password: '',
      roleId: '',
    },
    onSubmit: (data) => {
      createUser.mutate(data, {
        onSuccess: () => {
          reset({
            fullName: '',
            username: '',
            password: '',
            roleId: '',
          })
          setSelectedRoleId('')
          setOpen(false)
        },
      })
    },
  })

  const handleRoleChange = (value: string) => {
    setSelectedRoleId(value)
    setValue('roleId', value, {
      shouldDirty: true,
      shouldValidate: true,
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlusIcon />
          Crear usuario
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

            <FieldGroup className="grid grid-cols-2 gap-2">
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

              <PasswordInput
                {...register('password')}
                id="password"
                label="Contraseña"
                error={errors.password?.message}
                autoComplete="current-password"
              />
            </FieldGroup>

            <Field>
              <FieldLabel htmlFor="documentType">Rol</FieldLabel>

              <Select value={selectedRoleId} onValueChange={handleRoleChange}>
                <SelectTrigger
                  className="w-full"
                  id="documentType"
                  aria-invalid={!!errors.roleId}
                >
                  <SelectValue placeholder="Selecciona un tipo" />
                </SelectTrigger>

                <SelectContent>
                  <SelectGroup>
                    {roles.data?.items.map((role) => (
                      <SelectItem key={role.id} value={role.id}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>

              <FieldError className="text-destructive-active">
                {errors.roleId?.message}
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
