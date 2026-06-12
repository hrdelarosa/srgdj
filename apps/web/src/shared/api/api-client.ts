import { useAuthStore } from '@/modules/auth/store/auth.store'
import type { RequestOptions } from '../types/auth.type'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api/v1'

export async function apiClient<TResponse>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<TResponse> {
  const token = useAuthStore.getState().accessToken
  const headers = new Headers(options.headers)

  if (!(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }

  if (options.auth !== false && token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: 'Error inesperado',
    }))

    if (response.status === 401 && options.auth !== false) {
      useAuthStore.getState().clearSession()
    }

    throw {
      status: response.status,
      ...error,
    }
  }

  if (response.status === 204) return undefined as TResponse

  return response.json() as Promise<TResponse>
}
