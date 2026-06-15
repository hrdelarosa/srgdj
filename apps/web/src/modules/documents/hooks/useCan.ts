import { useAuthStore } from '@/modules/auth/store/auth.store'

export function useCan({ permission }: { permission?: string }) {
  const permissions = useAuthStore((state) => state.user?.permissions)

  if (!permission) return true

  return Boolean(permissions?.includes(permission))
}
