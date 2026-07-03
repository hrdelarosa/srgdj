import express from 'express'
import jwt from 'jsonwebtoken'
import request from 'supertest'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { errorHandler } from '../../middlewares/error-handler.js'
import { hashToken } from '../../utils/auth/hashToken.js'

const mocks = vi.hoisted(() => ({
  findValidSessionByTokenHash: vi.fn(),
  touchSession: vi.fn(),
  revokeSession: vi.fn(),
  findPermissionsByRoleId: vi.fn(),
}))

vi.mock('./auth.model.js', () => ({
  AuthModel: class {
    static findValidSessionByTokenHash = mocks.findValidSessionByTokenHash
    static touchSession = mocks.touchSession
    static revokeSession = mocks.revokeSession
    static findPermissionsByRoleId = mocks.findPermissionsByRoleId
  },
}))

const { requireAuth } = await import('../../middlewares/require-auth.js')
const { requirePermission } = await import('./require-permission.js')

const role = {
  id: '019e9bc2-a9d6-74c9-adad-9cad76f1d9e2',
  code: 'ADMIN',
  name: 'Administrador',
  isActive: true,
}

const user = {
  id: '019e9bc2-a9d6-74c9-adad-9cad76f1d9e1',
  username: 'admin',
  isActive: true,
  role,
}

const representativePermissions = [
  'documents:read',
  'documents:create',
  'documents:update',
  'documents:delete',
  'documents:remove',
  'users:read',
  'roles:read',
  'permissions:read',
  'catalogs:read',
  'audit:read',
]

function createTestApp() {
  const app = express()

  app.get('/protected', requireAuth, (_req, res) => {
    res.json({ ok: true })
  })

  app.get(
    '/documents',
    requireAuth,
    requirePermission({ permission: 'documents:read' }),
    (_req, res) => {
      res.json({ ok: true })
    },
  )

  representativePermissions.forEach((permission) => {
    app.get(
      `/permissions/${permission.replace(':', '-')}`,
      requireAuth,
      requirePermission({ permission }),
      (_req, res) => {
        res.json({ permission })
      },
    )
  })

  app.use(errorHandler)

  return app
}

function createAccessToken() {
  return jwt.sign(
    {
      sub: user.id,
      username: user.username,
      role: role.code,
    },
    process.env.JWT_SECRET!,
    { expiresIn: '15m' },
  )
}

function createSession({
  token,
  isUserActive = true,
  isRoleActive = true,
}: {
  token: string
  isUserActive?: boolean
  isRoleActive?: boolean
}) {
  return {
    id: '019e9bc2-a9d6-74c9-adad-9cad76f1d9f1',
    tokenHash: hashToken(token),
    expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    lastActivityAt: new Date(),
    revokedAt: null,
    user: {
      ...user,
      isActive: isUserActive,
      role: {
        ...role,
        isActive: isRoleActive,
      },
    },
  }
}

function allowPermissions(permissions: string[]) {
  mocks.findPermissionsByRoleId.mockResolvedValue(
    permissions.map((code) => ({ code })),
  )
}

beforeEach(() => {
  process.env.JWT_SECRET = 'test-secret'
  process.env.SESSION_INACTIVITY_MINUTES = '30'

  vi.clearAllMocks()
  allowPermissions(representativePermissions)
  mocks.touchSession.mockResolvedValue(undefined)
  mocks.revokeSession.mockResolvedValue(undefined)
})

describe('authorization middleware', () => {
  it('returns 401 for protected routes without token', async () => {
    const app = createTestApp()

    const response = await request(app).get('/protected')

    expect(response.status).toBe(401)
    expect(response.body.error.code).toBe('UNAUTHORIZED')
  })

  it('returns 401 for protected routes with invalid token', async () => {
    const app = createTestApp()

    const response = await request(app)
      .get('/protected')
      .set('Authorization', 'Bearer invalid-token')

    expect(response.status).toBe(401)
    expect(response.body.error.code).toBe('INVALID_TOKEN')
  })

  it('returns 403 for a valid user without the required permission', async () => {
    const token = createAccessToken()
    mocks.findValidSessionByTokenHash.mockResolvedValue(
      createSession({ token }),
    )
    allowPermissions(['users:read'])

    const app = createTestApp()
    const response = await request(app)
      .get('/documents')
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(403)
    expect(response.body.error.code).toBe('FORBIDDEN')
  })

  it('allows a valid user with the required permission', async () => {
    const token = createAccessToken()
    mocks.findValidSessionByTokenHash.mockResolvedValue(
      createSession({ token }),
    )
    allowPermissions(['documents:read'])

    const app = createTestApp()
    const response = await request(app)
      .get('/documents')
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(200)
    expect(response.body.ok).toBe(true)
  })

  it('rejects inactive users', async () => {
    const token = createAccessToken()
    mocks.findValidSessionByTokenHash.mockResolvedValue(
      createSession({ token, isUserActive: false }),
    )

    const app = createTestApp()
    const response = await request(app)
      .get('/protected')
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(401)
    expect(response.body.error.code).toBe('INACTIVE_USER')
    expect(mocks.revokeSession).toHaveBeenCalledWith({
      sessionId: '019e9bc2-a9d6-74c9-adad-9cad76f1d9f1',
      reason: 'inactive_user',
    })
  })

  it('rejects inactive roles', async () => {
    const token = createAccessToken()
    mocks.findValidSessionByTokenHash.mockResolvedValue(
      createSession({ token, isRoleActive: false }),
    )

    const app = createTestApp()
    const response = await request(app)
      .get('/protected')
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(401)
    expect(response.body.error.code).toBe('INACTIVE_ROLE')
    expect(mocks.revokeSession).toHaveBeenCalledWith({
      sessionId: '019e9bc2-a9d6-74c9-adad-9cad76f1d9f1',
      reason: 'inactive_role',
    })
  })

  it.each(representativePermissions)(
    'allows representative permission %s',
    async (permission) => {
      const token = createAccessToken()
      mocks.findValidSessionByTokenHash.mockResolvedValue(
        createSession({ token }),
      )
      allowPermissions([permission])

      const app = createTestApp()
      const response = await request(app)
        .get(`/permissions/${permission.replace(':', '-')}`)
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(200)
      expect(response.body.permission).toBe(permission)
    },
  )
})
