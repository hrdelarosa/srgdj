import type { AuthUser } from '../modules/auth/auth.type.ts'

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser
      sessionId?: string
    }
  }
}

export {}
