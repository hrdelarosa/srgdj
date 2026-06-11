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
      <FieldGroup>
        <Field>
          <FieldGroup className="gap-5">
            <Field>
              <FieldLabel htmlFor="user">Usuario</FieldLabel>
              <Input
                {...register('username')}
                id="user"
                type="text"
                autoComplete="username"
                autoFocus
              />
              <FieldError>{errors.username?.message}</FieldError>
            </Field>

            <PasswordInput
              {...register('password')}
              id="password"
              error={errors.password?.message}
              autoComplete="current-password"
            ></PasswordInput>
          </FieldGroup>
        </Field>

        <Field>
          <Button type="submit" size="lg" disabled={loginMutation.isPending}>
            {loginMutation.isPending ? <Spinner /> : 'Iniciar sesión'}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  )
}
