import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useLocation } from 'wouter'

import { authService } from '../services/auth.service'
import { useAuthStore } from '../store/auth.store'

export function useLogout() {
  const queryClient = useQueryClient()
  const [, setLocation] = useLocation()
  const clearSession = useAuthStore((state) => state.clearSession)

  return useMutation({
    mutationFn: authService.logout,
    onSettled: () => {
      clearSession()
      queryClient.clear()
      setLocation('/login')
    },
  })
}
