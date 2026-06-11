import { create } from 'zustand'
import type { AuthState, AuthUser } from '../types/auth.types'

const STORAGE_KEY = 'srgdj_auth'

function getInitialState(): Pick<
  AuthState,
  'user' | 'accessToken' | 'isAuthenticated'
> {
  const stored = localStorage.getItem(STORAGE_KEY)

  if (!stored) {
    return {
      user: null,
      accessToken: null,
      isAuthenticated: false,
    }
  }

  try {
    const parsed = JSON.parse(stored) as {
      user: AuthUser
      accessToken: string
    }

    return {
      user: parsed.user,
      accessToken: parsed.accessToken,
      isAuthenticated: true,
    }
  } catch {
    localStorage.removeItem(STORAGE_KEY)

    return {
      user: null,
      accessToken: null,
      isAuthenticated: false,
    }
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  ...getInitialState(),

  setSession: ({ user, accessToken }) => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        user,
        accessToken,
      }),
    )

    set({
      user,
      accessToken,
      isAuthenticated: true,
    })
  },

  clearSession: () => {
    localStorage.removeItem(STORAGE_KEY)

    set({
      user: null,
      accessToken: null,
      isAuthenticated: false,
    })
  },
}))
