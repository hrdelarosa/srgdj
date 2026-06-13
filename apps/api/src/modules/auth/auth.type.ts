export interface CreateSession {
  userId: string
  tokenHash: string
  refreshTokenHash: string
  expiresAt: Date
  lastActivityAt: Date
  createdByIp?: string | null
  userAgent?: string | null
}

export type AuthUser = {
  id: string
  username: string
  role: {
    id: string
    code: string
    name: string
  }
  permissions: string[]
}

export type AuthMeta = {
  ip?: string
  userAgent?: string
}
