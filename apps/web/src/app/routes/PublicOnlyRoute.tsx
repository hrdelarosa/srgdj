import { useAuthStore } from '@/modules/auth/store/auth.store'
import { Redirect } from 'wouter'
import { PublicLayout } from '../layouts/PublicLayout'

export function PublicOnlyRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()

  if (isAuthenticated) {
    return <Redirect to="/dashboard" />
  }

  return <PublicLayout>{children}</PublicLayout>
}
