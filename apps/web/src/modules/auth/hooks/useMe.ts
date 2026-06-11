import { useQuery } from '@tanstack/react-query'

import { authService } from '../services/auth.service'
import { useAuthStore } from '../store/auth.store'

export function useMe() {
  const accessToken = useAuthStore((state) => state.accessToken)

  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: authService.me,
    enabled: Boolean(accessToken),
    retry: false,
  })
}
