import { zodResolver } from '@hookform/resolvers/zod'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/shared/components/ui/field'
import { Input } from '@/shared/components/ui/input'
import { Button } from '@/shared/components/ui/button'
import { useLogin } from '../hooks/useLogin'
import { useForm, type SubmitHandler } from 'react-hook-form'
import { type LoginFormInput, loginFormSchema } from '../schema/login.schema'
import PasswordInput from './password-input'
import { Spinner } from '@/shared/components/ui/spinner'

export default function FormLogin() {
  const loginMutation = useLogin()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInput>({
    resolver: zodResolver(loginFormSchema),
  })

  const onSubmit: SubmitHandler<LoginFormInput> = (data: LoginFormInput) => {
    loginMutation.mutate({ data })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
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
