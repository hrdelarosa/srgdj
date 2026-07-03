import type { RequestHandler } from 'express'
import { AppError } from '../../utils/errors/app-error.js'

type Attempt = {
  count: number
  resetAt: number
}

const attempts = new Map<string, Attempt>()

const DEFAULT_WINDOW_MS = 15 * 60 * 1000
const DEFAULT_MAX_ATTEMPTS = 5

function getConfig() {
  return {
    windowMs: Number(process.env.LOGIN_RATE_LIMIT_WINDOW_MS ?? DEFAULT_WINDOW_MS),
    maxAttempts: Number(
      process.env.LOGIN_RATE_LIMIT_MAX_ATTEMPTS ?? DEFAULT_MAX_ATTEMPTS,
    ),
  }
}

function getClientKey(req: Parameters<RequestHandler>[0]) {
  return req.ip ?? req.socket.remoteAddress ?? 'unknown'
}

export const loginRateLimit: RequestHandler = (req, res, next) => {
  const { windowMs, maxAttempts } = getConfig()
  const now = Date.now()
  const key = getClientKey(req)
  const current = attempts.get(key)

  if (!current || current.resetAt <= now) {
    attempts.set(key, { count: 1, resetAt: now + windowMs })
    return next()
  }

  if (current.count >= maxAttempts) {
    return next(
      new AppError({
        message: 'Demasiados intentos de inicio de sesión',
        statusCode: 429,
        code: 'LOGIN_RATE_LIMITED',
      }),
    )
  }

  current.count += 1
  attempts.set(key, current)
  next()
}

export function resetLoginRateLimit() {
  attempts.clear()
}
