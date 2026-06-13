export type AuthRole = {
  id: string
  code: string
  name: string
}

export type AuthUser = {
  id: string
  username: string
  fullName: string
  role: AuthRole
  permissions: string[]
  mustChangePassword: boolean
}

export type LoginResponse = {
  accessToken: string
  user: AuthUser
}

export type LoginInput = {
  username: string
  password: string
}

export interface AuthState {
  user: AuthUser | null
  accessToken: string | null
  isAuthenticated: boolean

  setSession: (data: { user: AuthUser; accessToken: string }) => void
  clearSession: () => void
}
