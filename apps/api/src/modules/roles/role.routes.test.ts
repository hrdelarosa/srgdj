import express from 'express'
import type { NextFunction, Request, Response } from 'express'
import request from 'supertest'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { errorHandler } from '../../middlewares/error-handler.js'
import { AppError } from '../../utils/errors/app-error.js'

const mocks = vi.hoisted(() => ({
  auditCreate: vi.fn(),
  findAll: vi.fn(),
  findById: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  setActive: vi.fn(),
  findPermissionsByRoleId: vi.fn(),
  updatePermissions: vi.fn(),
}))

let userPermissions = [
  'roles:read',
  'roles:create',
  'roles:update',
  'roles:permissions:update',
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

vi.mock('./role.model.js', () => ({
  RoleModel: class {
    static findAll = mocks.findAll
    static findById = mocks.findById
    static create = mocks.create
    static update = mocks.update
    static setActive = mocks.setActive
    static findPermissionsByRoleId = mocks.findPermissionsByRoleId
    static updatePermissions = mocks.updatePermissions
  },
}))

const { roleRoutes } = await import('./role.routes.js')

function createTestApp() {
  const app = express()
  app.use(express.json())
  app.use('/roles', roleRoutes)
  app.use(errorHandler)
  return app
}

const sampleRole = {
  id: '019e9bc2-a9d6-74c9-adad-9cad76f1d9e2',
  code: 'ENCARGADO',
  name: 'Encargado',
  description: 'Gestiona documentos',
  isActive: true,
  createdAt: new Date('2026-06-01'),
  updatedAt: new Date('2026-06-01'),
}

const samplePermission = {
  id: '019e9bc2-a9d6-74c9-adad-9cad76f1d9a1',
  code: 'documents:read',
  name: 'Leer documentos',
  description: null,
  isSystem: true,
  isActive: true,
}

beforeEach(() => {
  userPermissions = [
    'roles:read',
    'roles:create',
    'roles:update',
    'roles:permissions:update',
  ]
  vi.clearAllMocks()

  mocks.auditCreate.mockResolvedValue(undefined)
  mocks.findAll.mockResolvedValue([sampleRole])
  mocks.findById.mockResolvedValue(sampleRole)
  mocks.create.mockResolvedValue(sampleRole)
  mocks.update.mockResolvedValue(sampleRole)
  mocks.setActive.mockResolvedValue(sampleRole)
  mocks.findPermissionsByRoleId.mockResolvedValue([samplePermission])
  mocks.updatePermissions.mockResolvedValue([samplePermission])
})

describe('role routes', () => {
  it('lista roles', async () => {
    const app = createTestApp()

    const response = await request(app).get('/roles')

    expect(response.status).toBe(200)
    expect(response.body.items).toEqual([
      expect.objectContaining({
        id: sampleRole.id,
        code: sampleRole.code,
      }),
    ])
    expect(mocks.findAll).toHaveBeenCalledOnce()
  })

  it('crea roles', async () => {
    const app = createTestApp()

    const response = await request(app).post('/roles').send({
      code: 'ENCARGADO',
      name: 'Encargado',
      description: 'Gestiona documentos',
      isActive: true,
    })

    expect(response.status).toBe(201)
    expect(response.body).toEqual(
      expect.objectContaining({
        id: sampleRole.id,
        code: sampleRole.code,
      }),
    )
    expect(mocks.create).toHaveBeenCalledWith({
      data: {
        code: 'ENCARGADO',
        name: 'Encargado',
        description: 'Gestiona documentos',
        isActive: true,
      },
    })
  })

  it('actualiza roles', async () => {
    const app = createTestApp()

    const response = await request(app)
      .put(`/roles/${sampleRole.id}`)
      .send({ name: 'Encargado actualizado' })

    expect(response.status).toBe(200)
    expect(response.body.id).toBe(sampleRole.id)
    expect(mocks.update).toHaveBeenCalledWith({
      id: sampleRole.id,
      data: { name: 'Encargado actualizado' },
    })
  })

  it('asigna permisos a un rol', async () => {
    const app = createTestApp()

    const response = await request(app)
      .put(`/roles/${sampleRole.id}/permissions`)
      .send({ permissionIds: [samplePermission.id] })

    expect(response.status).toBe(200)
    expect(response.body.items).toEqual([
      expect.objectContaining({
        id: samplePermission.id,
        code: samplePermission.code,
      }),
    ])
    expect(mocks.updatePermissions).toHaveBeenCalledWith({
      id: sampleRole.id,
      data: { permissionIds: [samplePermission.id] },
    })
  })

  it('rechaza permission ids inválidos al asignar permisos', async () => {
    mocks.updatePermissions.mockRejectedValue(
      new AppError({
        message: 'No se pueden asignar permisos inactivos o inexistentes',
        statusCode: 400,
        code: 'INVALID_ROLE_PERMISSIONS',
      }),
    )
    const app = createTestApp()

    const response = await request(app)
      .put(`/roles/${sampleRole.id}/permissions`)
      .send({ permissionIds: [samplePermission.id] })

    expect(response.status).toBe(400)
    expect(response.body.error.code).toBe('INVALID_ROLE_PERMISSIONS')
  })

  it('requiere permiso roles:read para listar roles', async () => {
    userPermissions = []
    const app = createTestApp()

    const response = await request(app).get('/roles')

    expect(response.status).toBe(403)
    expect(response.body.error.code).toBe('FORBIDDEN')
    expect(mocks.findAll).not.toHaveBeenCalled()
  })

  it('requiere permiso roles:permissions:update para asignar permisos', async () => {
    userPermissions = ['roles:read']
    const app = createTestApp()

    const response = await request(app)
      .put(`/roles/${sampleRole.id}/permissions`)
      .send({ permissionIds: [samplePermission.id] })

    expect(response.status).toBe(403)
    expect(response.body.error.code).toBe('FORBIDDEN')
    expect(mocks.updatePermissions).not.toHaveBeenCalled()
  })
})
