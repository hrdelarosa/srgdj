import { Redirect } from 'wouter'
import { PrivateLayout } from '../layouts/PrivateLayout'
import { useAuthStore } from '@/modules/auth/store/auth.store'

export function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()

  if (!isAuthenticated) {
    return <Redirect to="/login" />
  }

  return <PrivateLayout>{children}</PrivateLayout>
}
