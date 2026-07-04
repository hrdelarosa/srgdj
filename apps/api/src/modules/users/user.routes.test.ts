import express from 'express'
import type { NextFunction, Request, Response } from 'express'
import request from 'supertest'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { errorHandler } from '../../middlewares/error-handler.js'

const mocks = vi.hoisted(() => ({
  hashPassword: vi.fn(),
  auditCreate: vi.fn(),
  findAll: vi.fn(),
  findById: vi.fn(),
  findByUsername: vi.fn(),
  findRoleById: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  setActive: vi.fn(),
}))

let userPermissions = ['users:read', 'users:create', 'users:update', 'users:deactivate']

vi.mock('argon2', () => ({
  default: {
    hash: mocks.hashPassword,
  },
}))

vi.mock('../../middlewares/require-auth.js', () => ({
  requireAuth: (req: Request, _res: Response, next: NextFunction) => {
    req.user = {
      id: '019e9bc2-a9d6-74c9-adad-9cad76f1d9e1',
      username: 'admin',
      role: {
        id: '019e9bc2-a9d6-74c9-adad-9cad76f1d9e2',
        code: 'ADMIN',
        name: 'Administrador',
        isActive: true,
      },
      permissions: userPermissions,
    }
    next()
  },
}))

vi.mock('../auth/require-permission.js', () => ({
  requirePermission:
    ({ permission }: { permission: string }) =>
    (req: Request, res: Response, next: NextFunction) => {
      if (!req.user?.permissions.includes(permission)) {
        return res.status(403).json({
          error: {
            code: 'FORBIDDEN',
            message: 'No autorizado',
          },
        })
      }

      next()
    },
}))

vi.mock('../audit/audit.service.js', () => ({
  AuditService: {
    create: mocks.auditCreate,
  },
}))

vi.mock('./user.model.js', () => ({
  UserModel: class {
    static findAll = mocks.findAll
    static findById = mocks.findById
    static findByUsername = mocks.findByUsername
    static findRoleById = mocks.findRoleById
    static create = mocks.create
    static update = mocks.update
    static setActive = mocks.setActive
  },
}))

const { userRoutes } = await import('./user.routes.js')

function createTestApp() {
  const app = express()
  app.use(express.json())
  app.use('/users', userRoutes)
  app.use(errorHandler)
  return app
}

const role = {
  id: '019e9bc2-a9d6-74c9-adad-9cad76f1d9e2',
  code: 'USUARIO',
  name: 'Usuario',
  isActive: true,
}

const sampleUser = {
  id: '019e9bc2-a9d6-74c9-adad-9cad76f1d9e3',
  username: 'jlopez',
  fullName: 'Juan Lopez',
  isActive: true,
  mustChangePassword: true,
  lastLoginAt: null,
  createdAt: new Date('2026-06-01'),
  updatedAt: new Date('2026-06-01'),
  role,
}

const createUserPayload = {
  username: 'jlopez',
  password: 'Password123',
  fullName: 'Juan Lopez',
  roleId: role.id,
  isActive: true,
  mustChangePassword: true,
}

beforeEach(() => {
  userPermissions = ['users:read', 'users:create', 'users:update', 'users:deactivate']
  vi.clearAllMocks()

  mocks.hashPassword.mockResolvedValue('hashed-password')
  mocks.auditCreate.mockResolvedValue(undefined)
  mocks.findAll.mockResolvedValue([sampleUser])
  mocks.findById.mockResolvedValue(sampleUser)
  mocks.findByUsername.mockResolvedValue(null)
  mocks.findRoleById.mockResolvedValue(role)
  mocks.create.mockResolvedValue(sampleUser)
  mocks.update.mockResolvedValue(sampleUser)
  mocks.setActive.mockResolvedValue({ ...sampleUser, isActive: false })
})

describe('user routes', () => {
  it('lista usuarios', async () => {
    const app = createTestApp()

    const response = await request(app).get('/users')

    expect(response.status).toBe(200)
    expect(response.body.items).toEqual([
      expect.objectContaining({
        id: sampleUser.id,
        username: sampleUser.username,
      }),
    ])
    expect(mocks.findAll).toHaveBeenCalledOnce()
  })

  it('crea usuarios', async () => {
    const app = createTestApp()

    const response = await request(app).post('/users').send(createUserPayload)

    expect(response.status).toBe(201)
    expect(response.body).toEqual(
      expect.objectContaining({
        id: sampleUser.id,
        username: sampleUser.username,
      }),
    )
    expect(mocks.findByUsername).toHaveBeenCalledWith({
      username: createUserPayload.username,
    })
    expect(mocks.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        username: createUserPayload.username,
        passwordHash: 'hashed-password',
        createdByUserId: '019e9bc2-a9d6-74c9-adad-9cad76f1d9e1',
      }),
    })
  })

  it('rechaza username duplicado', async () => {
    mocks.findByUsername.mockResolvedValue({ id: sampleUser.id })
    const app = createTestApp()

    const response = await request(app).post('/users').send(createUserPayload)

    expect(response.status).toBe(409)
    expect(response.body.error.code).toBe('USERNAME_ALREADY_EXISTS')
    expect(mocks.create).not.toHaveBeenCalled()
  })

  it('actualiza usuarios', async () => {
    const app = createTestApp()

    const response = await request(app)
      .put(`/users/${sampleUser.id}`)
      .send({ fullName: 'Juan Lopez Actualizado', roleId: role.id })

    expect(response.status).toBe(200)
    expect(response.body.id).toBe(sampleUser.id)
    expect(mocks.update).toHaveBeenCalledWith({
      id: sampleUser.id,
      data: { fullName: 'Juan Lopez Actualizado', roleId: role.id },
    })
  })

  it('desactiva usuarios', async () => {
    const app = createTestApp()

    const response = await request(app).patch(`/users/${sampleUser.id}/desactivate`)

    expect(response.status).toBe(200)
    expect(response.body.isActive).toBe(false)
    expect(mocks.setActive).toHaveBeenCalledWith({
      id: sampleUser.id,
      isActive: false,
    })
  })

  it('requiere permiso users:read para listar usuarios', async () => {
    userPermissions = []
    const app = createTestApp()

    const response = await request(app).get('/users')

    expect(response.status).toBe(403)
    expect(response.body.error.code).toBe('FORBIDDEN')
    expect(mocks.findAll).not.toHaveBeenCalled()
  })
})
