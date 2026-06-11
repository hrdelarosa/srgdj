import { apiClient } from '@/shared/api/api-client'
import type { LoginResponse, LoginInput } from '../types/auth.types'

export const authService = {
  async login({ data }: { data: LoginInput }) {
    const response = await apiClient<LoginResponse>('/auth/login', {
      method: 'POST',
      auth: false,
      body: JSON.stringify(data),
    })

    return response
  },

  async me() {
    const response = await apiClient<{ user: LoginResponse['user'] }>(
      '/auth/me',
    )

    return response
  },

  async logout() {
    await apiClient<void>('/auth/logout', {
      method: 'POST',
    })
  },
}
