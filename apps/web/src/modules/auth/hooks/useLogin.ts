import { useMutation } from '@tanstack/react-query'
import { useLocation } from 'wouter'
import { authService } from '../services/auth.service'
import { useAuthStore } from '../store/auth.store'
import type { LoginInput } from '../types/auth.types'
import { toast } from 'sonner'

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
    onError: (error: {
      error: { message: string; statusCode: number; code: string }
    }) => {
      toast.error(error.error.message ?? 'Usuario o contraseña incorrectos')
    },
  })
}
