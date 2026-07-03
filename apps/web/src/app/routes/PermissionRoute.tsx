import { Redirect } from 'wouter'
import { PrivateLayout } from '../layouts/PrivateLayout'
import { useAuthStore } from '@/modules/auth/store/auth.store'

type PermissionRouteProps = {
  permission: string
  children: React.ReactNode
}

export function PermissionRoute({
  permission,
  children,
}: PermissionRouteProps) {
  const { isAuthenticated, user } = useAuthStore()

  if (!isAuthenticated) {
    return <Redirect to="/login" />
  }

  if (!user?.permissions.includes(permission)) {
    return <Redirect to="/home" />
  }

  return <PrivateLayout>{children}</PrivateLayout>
}
