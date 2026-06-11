// import { useState } from 'react'

// import { useLogin } from '@/modules/auth/hooks/useLogin'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card'
// import { Field, FieldGroup, FieldLabel } from '@/shared/components/ui/field'
// import { Input } from '@/shared/components/ui/input'
// import {
//   InputGroup,
//   InputGroupAddon,
//   InputGroupInput,
// } from '@/shared/components/ui/input-group'
// import { Eye } from 'lucide-react'
// import { Button } from '@/shared/components/ui/button'
import FormLogin from '@/modules/auth/components/FormLogin'

export function LoginPage() {
  // const loginMutation = useLogin()

  // const [username, setUsername] = useState('admin')
  // const [password, setPassword] = useState('Admin123*')

  // function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
  //   event.preventDefault()

  //   loginMutation.mutate({
  //     data: { username, password },
  //   })
  // }

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">
          Bienvenido de Nuevo
        </CardTitle>

        <CardDescription>
          Inicia sesión con su nombre de usuario y contraseña
        </CardDescription>
      </CardHeader>

      <CardContent>
        <FormLogin />
        {/* <form onSubmit={handleSubmit} noValidate>
          <FieldGroup>
            <Field>
              <FieldGroup className="gap-5">
                <Field>
                  <FieldLabel htmlFor="user">Usuario</FieldLabel>
                  <Input
                    id="user"
                    type="text"
                    autoComplete="username"
                    autoFocus
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="password">Contraseña</FieldLabel>
                  <InputGroup>
                    <InputGroupInput
                      id="password"
                      type="password"
                      autoComplete="current-password"
                    />
                    <InputGroupAddon align="inline-end">
                      <Eye />
                    </InputGroupAddon>
                  </InputGroup>
                </Field>
              </FieldGroup>
            </Field>

            <Field>
              <Button
                type="submit"
                size="lg"
              >
                Iniciar sesión
              </Button>
            </Field>
          </FieldGroup>
        </form> */}
      </CardContent>
    </Card>
    // <section>
    //   <h1>Iniciar sesión</h1>

    //   <form onSubmit={handleSubmit}>
    //     <div>
    //       <label htmlFor="username">Usuario</label>
    //       <input
    //         id="username"
    //         value={username}
    //         onChange={(event) => setUsername(event.target.value)}
    //       />
    //     </div>

    //     <div>
    //       <label htmlFor="password">Contraseña</label>
    //       <input
    //         id="password"
    //         type="password"
    //         value={password}
    //         onChange={(event) => setPassword(event.target.value)}
    //       />
    //     </div>

    //     {loginMutation.isError && <p>Usuario o contraseña incorrectos</p>}

    //     <button type="submit" disabled={loginMutation.isPending}>
    //       {loginMutation.isPending ? 'Entrando...' : 'Entrar'}
    //     </button>
    //   </form>
    // </section>
  )
}
