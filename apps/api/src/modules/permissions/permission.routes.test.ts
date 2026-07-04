import express from 'express'
import type { NextFunction, Request, Response } from 'express'
import request from 'supertest'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { errorHandler } from '../../middlewares/error-handler.js'

const mocks = vi.hoisted(() => ({
  auditCreate: vi.fn(),
  findAll: vi.fn(),
  findById: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  setActive: vi.fn(),
}))

let userPermissions = [
  'permissions:read',
  'permissions:create',
  'permissions:update',
]

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

vi.mock('./permission.model.js', () => ({
  PermissionModel: class {
    static findAll = mocks.findAll
    static findById = mocks.findById
    static create = mocks.create
    static update = mocks.update
    static setActive = mocks.setActive
  },
}))

const { permissionRoutes } = await import('./permission.routes.js')

function createTestApp() {
  const app = express()
  app.use(express.json())
  app.use('/permissions', permissionRoutes)
  app.use(errorHandler)
  return app
}

const samplePermission = {
  id: '019e9bc2-a9d6-74c9-adad-9cad76f1d9a1',
  code: 'documents:read',
  name: 'Leer documentos',
  description: null,
  isSystem: false,
  isActive: true,
  createdAt: new Date('2026-06-01'),
  updatedAt: new Date('2026-06-01'),
}

beforeEach(() => {
  userPermissions = [
    'permissions:read',
    'permissions:create',
    'permissions:update',
  ]
  vi.clearAllMocks()

  mocks.auditCreate.mockResolvedValue(undefined)
  mocks.findAll.mockResolvedValue([samplePermission])
  mocks.findById.mockResolvedValue(samplePermission)
  mocks.create.mockResolvedValue(samplePermission)
  mocks.update.mockResolvedValue(samplePermission)
  mocks.setActive.mockResolvedValue(samplePermission)
})

describe('permission routes', () => {
  it('lista permisos', async () => {
    const app = createTestApp()

    const response = await request(app).get('/permissions')

    expect(response.status).toBe(200)
    expect(response.body.items).toEqual([
      expect.objectContaining({
        id: samplePermission.id,
        code: samplePermission.code,
      }),
    ])
    expect(mocks.findAll).toHaveBeenCalledOnce()
  })

  it('crea permisos', async () => {
    const app = createTestApp()

    const response = await request(app).post('/permissions').send({
      code: 'reports:read',
      name: 'Leer reportes',
      description: 'Permite leer reportes',
      isSystem: false,
      isActive: true,
    })

    expect(response.status).toBe(201)
    expect(response.body).toEqual(
      expect.objectContaining({
        id: samplePermission.id,
        code: samplePermission.code,
      }),
    )
    expect(mocks.create).toHaveBeenCalledWith({
      data: {
        code: 'reports:read',
        name: 'Leer reportes',
        description: 'Permite leer reportes',
        isSystem: false,
        isActive: true,
      },
    })
  })

  it('actualiza permisos', async () => {
    const app = createTestApp()

    const response = await request(app)
      .put(`/permissions/${samplePermission.id}`)
      .send({ name: 'Leer documentos actualizado' })

    expect(response.status).toBe(200)
    expect(response.body.id).toBe(samplePermission.id)
    expect(mocks.update).toHaveBeenCalledWith({
      id: samplePermission.id,
      data: { name: 'Leer documentos actualizado' },
    })
  })

  it('requiere permiso permissions:read para listar permisos', async () => {
    userPermissions = []
    const app = createTestApp()

    const response = await request(app).get('/permissions')

    expect(response.status).toBe(403)
    expect(response.body.error.code).toBe('FORBIDDEN')
    expect(mocks.findAll).not.toHaveBeenCalled()
  })

  it('requiere permiso permissions:update para actualizar permisos', async () => {
    userPermissions = ['permissions:read']
    const app = createTestApp()

    const response = await request(app)
      .put(`/permissions/${samplePermission.id}`)
      .send({ name: 'Leer documentos actualizado' })

    expect(response.status).toBe(403)
    expect(response.body.error.code).toBe('FORBIDDEN')
    expect(mocks.update).not.toHaveBeenCalled()
  })
})
