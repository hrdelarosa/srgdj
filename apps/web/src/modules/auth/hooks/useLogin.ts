import { useMutation } from '@tanstack/react-query'
import { useLocation } from 'wouter'
import { authService } from '../services/auth.service'
import { useAuthStore } from '../store/auth.store'
import type { LoginInput } from '../types/auth.types'
import { toast } from 'sonner'
import type { ApiError } from '@/shared/types/errors.type'

export function useLogin() {
  const [, setLocation] = useLocation()
  const setSession = useAuthStore((state) => state.setSession)

  return useMutation({
    mutationFn: async ({ data }: { data: LoginInput }) => {
      return authService.login({ data })
    },
    onSuccess: (data) => {
      setSession(data)
      setLocation('/home')
    },
    onError: (error: ApiError) => {
      toast.error(error.error.message ?? 'Usuario o contraseña incorrectos')
    },
  })
}
