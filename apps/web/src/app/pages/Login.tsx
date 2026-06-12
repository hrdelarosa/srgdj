import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card'
import FormLogin from '@/modules/auth/components/FormLogin'

export function LoginPage() {
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
      </CardContent>
    </Card>
  )
}
