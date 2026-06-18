import { loginFormSchema } from '../schema/login.schema'

import { Input } from '@/shared/components/ui/input'
import { Button } from '@/shared/components/ui/button'
import { Spinner } from '@/shared/components/ui/spinner'
import PasswordInput from './password-input'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/shared/components/ui/field'
import { useLogin } from '../hooks/useLogin'
import { useValidatedForm } from '@/shared/hooks/useValidatedForm'

export default function FormLogin() {
  const loginMutation = useLogin()
  const { register, handleSubmit, errors } = useValidatedForm({
    formSchema: loginFormSchema,
    onSubmit: (data) => loginMutation.mutate({ data }),
  })

  return (
    <form onSubmit={handleSubmit}>
      <FieldGroup className="gap-7">
        <Field>
          <FieldGroup className="gap-3.5">
            <Field className="gap-1.5">
              <FieldLabel htmlFor="user">Usuario</FieldLabel>
              <Input
                {...register('username')}
                id="user"
                type="text"
                autoComplete="username"
                autoFocus
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
        </Field>

        <Field>
          <Button
            type="submit"
            size="lg"
            disabled={loginMutation.isPending}
            className="hover:bg-primary-hover"
          >
            {loginMutation.isPending ? <Spinner /> : 'Iniciar sesión'}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  )
}
