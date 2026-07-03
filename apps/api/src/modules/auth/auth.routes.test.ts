import express from 'express'
import request from 'supertest'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { errorHandler } from '../../middlewares/error-handler.js'
import { hashToken } from '../../utils/auth/hashToken.js'
import { resetLoginRateLimit } from './login-rate-limit.js'

const mocks = vi.hoisted(() => ({
  verifyPassword: vi.fn(),
  auditCreate: vi.fn(),
  findUserByUsername: vi.fn(),
  createSession: vi.fn(),
  updateLastLogin: vi.fn(),
  findValidSessionByTokenHash: vi.fn(),
  findValidSessionByRefreshTokenHash: vi.fn(),
  touchSession: vi.fn(),
  rotateSession: vi.fn(),
  revokeSession: vi.fn(),
  findSessionsByUserId: vi.fn(),
  findPermissionsByRoleId: vi.fn(),
}))

vi.mock('argon2', () => ({
  default: {
    verify: mocks.verifyPassword,
  },
}))

vi.mock('../audit/audit.service.js', () => ({
  AuditService: {
    create: mocks.auditCreate,
  },
}))

vi.mock('./auth.model.js', () => ({
  AuthModel: class {
    static findUserByUsername = mocks.findUserByUsername
    static createSession = mocks.createSession
    static updateLastLogin = mocks.updateLastLogin
    static findValidSessionByTokenHash = mocks.findValidSessionByTokenHash
    static findValidSessionByRefreshTokenHash =
      mocks.findValidSessionByRefreshTokenHash
    static touchSession = mocks.touchSession
    static rotateSession = mocks.rotateSession
    static revokeSession = mocks.revokeSession
    static findSessionsByUserId = mocks.findSessionsByUserId
    static findPermissionsByRoleId = mocks.findPermissionsByRoleId
  },
}))

const { authRoutes } = await import('./auth.routes.js')

function createTestApp() {
  const app = express()
  app.use(express.json())
  app.use('/auth', authRoutes)
  app.use(errorHandler)
  return app
}

const activeRole = {
  id: '019e9bc2-a9d6-74c9-adad-9cad76f1d9e2',
  code: 'ADMIN',
  name: 'Administrador',
  isActive: true,
}

const activeUser = {
  id: '019e9bc2-a9d6-74c9-adad-9cad76f1d9e1',
  username: 'admin',
  passwordHash: 'hashed-password',
  fullName: 'Administrador',
  isActive: true,
  mustChangePassword: false,
  role: activeRole,
}

type TestSession = {
  id: string
  userId: string
  tokenHash: string
  refreshTokenHash: string
  expiresAt: Date
  lastActivityAt: Date
  revokedAt: Date | null
  revokedReason: string | null
  user: typeof activeUser
}

const sessions = new Map<string, TestSession>()
let sessionSequence = 0
let currentUser: typeof activeUser | null = activeUser

function getRefreshCookie(response: request.Response) {
  const setCookie = response.headers['set-cookie']
  const cookies = Array.isArray(setCookie) ? setCookie : [setCookie]
  const refreshCookie = cookies.find((cookie) =>
    cookie?.startsWith('srgdj_refresh_token='),
  )

  if (!refreshCookie) throw new Error('Refresh cookie was not set')

  return refreshCookie.split(';')[0]
}

async function login(app: express.Express) {
  return request(app)
    .post('/auth/login')
    .send({ username: 'admin', password: 'secret' })
}

beforeEach(() => {
  process.env.JWT_SECRET = 'test-secret'
  process.env.JWT_EXPIRES_IN = '15m'
  process.env.REFRESH_TOKEN_DAYS = '7'
  process.env.SESSION_INACTIVITY_MINUTES = '30'
  process.env.LOGIN_RATE_LIMIT_MAX_ATTEMPTS = '100'
  process.env.LOGIN_RATE_LIMIT_WINDOW_MS = '60000'

  resetLoginRateLimit()
  sessions.clear()
  sessionSequence = 0
  currentUser = activeUser

  vi.clearAllMocks()

  mocks.verifyPassword.mockResolvedValue(true)
  mocks.auditCreate.mockResolvedValue(undefined)
  mocks.findUserByUsername.mockImplementation(
    async ({ username }: { username: string }) =>
      currentUser?.username === username ? currentUser : null,
  )
  mocks.createSession.mockImplementation(async ({ data }) => {
    sessionSequence += 1

    const session: TestSession = {
      id: `019e9bc2-a9d6-74c9-adad-9cad76f1d9f${sessionSequence}`,
      ...data,
      revokedAt: null,
      revokedReason: null,
      user: currentUser ?? activeUser,
    }

    sessions.set(session.id, session)

    return session
  })
  mocks.updateLastLogin.mockResolvedValue(undefined)
  mocks.findPermissionsByRoleId.mockResolvedValue([
    { code: 'documents:read' },
    { code: 'users:read' },
  ])
  mocks.findValidSessionByTokenHash.mockImplementation(
    async ({ tokenHash }: { tokenHash: string }) =>
      [...sessions.values()].find((session) => session.tokenHash === tokenHash) ??
      null,
  )
  mocks.findValidSessionByRefreshTokenHash.mockImplementation(
    async ({ refreshTokenHash }: { refreshTokenHash: string }) =>
      [...sessions.values()].find(
        (session) => session.refreshTokenHash === refreshTokenHash,
      ) ?? null,
  )
  mocks.touchSession.mockImplementation(
    async ({ sessionId, date }: { sessionId: string; date: Date }) => {
      const session = sessions.get(sessionId)
      if (session) session.lastActivityAt = date
    },
  )
  mocks.rotateSession.mockImplementation(
    async ({
      sessionId,
      tokenHash,
      refreshTokenHash,
      expiresAt,
      date,
    }: {
      sessionId: string
      tokenHash: string
      refreshTokenHash: string
      expiresAt: Date
      date: Date
    }) => {
      const session = sessions.get(sessionId)

      if (!session) return

      session.tokenHash = tokenHash
      session.refreshTokenHash = refreshTokenHash
      session.expiresAt = expiresAt
      session.lastActivityAt = date
    },
  )
  mocks.revokeSession.mockImplementation(
    async ({
      sessionId,
      reason,
    }: {
      sessionId: string
      reason?: string
    }) => {
      const session = sessions.get(sessionId)

      if (!session) return

      session.revokedAt = new Date()
      session.revokedReason = reason ?? null
    },
  )
  mocks.findSessionsByUserId.mockResolvedValue([])
})

describe('POST /auth/login', () => {
  it('inicia sesión con credenciales válidas', async () => {
    const app = createTestApp()

    const response = await login(app)

    expect(response.status).toBe(200)
    expect(response.body.accessToken).toEqual(expect.any(String))
    expect(response.body.refreshToken).toBeUndefined()
    expect(response.body.user).toMatchObject({
      id: activeUser.id,
      username: activeUser.username,
      fullName: activeUser.fullName,
      role: activeRole,
      permissions: ['documents:read', 'users:read'],
      mustChangePassword: false,
    })
    expect(getRefreshCookie(response)).toContain('srgdj_refresh_token=')
    expect(mocks.createSession).toHaveBeenCalledOnce()
    expect(mocks.updateLastLogin).toHaveBeenCalledWith({ id: activeUser.id })
  })

  it('rechaza credenciales inválidas', async () => {
    mocks.verifyPassword.mockResolvedValue(false)

    const app = createTestApp()
    const response = await request(app)
      .post('/auth/login')
      .send({ username: 'admin', password: 'wrong-password' })

    expect(response.status).toBe(401)
    expect(response.body.error.code).toBe('INVALID_CREDENTIALS')
    expect(mocks.createSession).not.toHaveBeenCalled()
  })

  it('rechaza usuarios inactivos', async () => {
    currentUser = {
      ...activeUser,
      isActive: false,
    }

    const app = createTestApp()
    const response = await login(app)

    expect(response.status).toBe(403)
    expect(response.body.error.code).toBe('INACTIVE_USER')
    expect(mocks.createSession).not.toHaveBeenCalled()
  })
})

describe('GET /auth/me', () => {
  it('devuelve el usuario autenticado con token válido', async () => {
    const app = createTestApp()
    const loginResponse = await login(app)

    const response = await request(app)
      .get('/auth/me')
      .set('Authorization', `Bearer ${loginResponse.body.accessToken}`)

    expect(response.status).toBe(200)
    expect(response.body.user).toMatchObject({
      id: activeUser.id,
      username: activeUser.username,
      role: activeRole,
      permissions: ['documents:read', 'users:read'],
    })
    expect(mocks.touchSession).toHaveBeenCalledOnce()
  })

  it('devuelve 401 cuando no hay token', async () => {
    const app = createTestApp()

    const response = await request(app).get('/auth/me')

    expect(response.status).toBe(401)
    expect(response.body.error.code).toBe('UNAUTHORIZED')
  })
})

describe('POST /auth/refresh', () => {
  it('rota el refresh token y emite un nuevo access token', async () => {
    const app = createTestApp()
    const loginResponse = await login(app)
    const originalRefreshCookie = getRefreshCookie(loginResponse)

    const response = await request(app)
      .post('/auth/refresh')
      .set('Cookie', originalRefreshCookie)

    expect(response.status).toBe(200)
    expect(response.body.accessToken).toEqual(expect.any(String))
    expect(getRefreshCookie(response)).not.toBe(originalRefreshCookie)
    expect(mocks.rotateSession).toHaveBeenCalledOnce()

    const reusedTokenResponse = await request(app)
      .post('/auth/refresh')
      .set('Cookie', originalRefreshCookie)

    expect(reusedTokenResponse.status).toBe(401)
    expect(reusedTokenResponse.body.error.code).toBe('INVALID_SESSION')
  })

  it('rechaza refresh tokens de sesiones revocadas', async () => {
    const app = createTestApp()
    const loginResponse = await login(app)
    const refreshCookie = getRefreshCookie(loginResponse)

    await request(app)
      .post('/auth/logout')
      .set('Authorization', `Bearer ${loginResponse.body.accessToken}`)

    const response = await request(app)
      .post('/auth/refresh')
      .set('Cookie', refreshCookie)

    expect(response.status).toBe(401)
    expect(response.body.error.code).toBe('INVALID_SESSION')
  })
})

describe('POST /auth/logout', () => {
  it('revoca la sesión autenticada', async () => {
    const app = createTestApp()
    const loginResponse = await login(app)
    const accessToken = loginResponse.body.accessToken
    const tokenHash = hashToken(accessToken)
    const session = [...sessions.values()].find(
      (item) => item.tokenHash === tokenHash,
    )

    const response = await request(app)
      .post('/auth/logout')
      .set('Authorization', `Bearer ${accessToken}`)

    expect(response.status).toBe(204)
    expect(mocks.revokeSession).toHaveBeenCalledWith({
      sessionId: session?.id,
      reason: 'logout',
    })
    expect(session?.revokedAt).toBeInstanceOf(Date)
    expect(session?.revokedReason).toBe('logout')
  })
})

describe('POST /auth/login rate limit', () => {
  beforeEach(() => {
    process.env.LOGIN_RATE_LIMIT_MAX_ATTEMPTS = '2'
    process.env.LOGIN_RATE_LIMIT_WINDOW_MS = '60000'
    resetLoginRateLimit()
  })

  it('limita intentos repetidos de login por cliente', async () => {
    const app = createTestApp()

    await request(app).post('/auth/login').send({})
    await request(app).post('/auth/login').send({})

    const response = await request(app).post('/auth/login').send({})

    expect(response.status).toBe(429)
    expect(response.body.error.code).toBe('LOGIN_RATE_LIMITED')
  })
})
