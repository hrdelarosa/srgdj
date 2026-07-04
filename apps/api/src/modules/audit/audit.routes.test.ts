import express from 'express'
import type { NextFunction, Request, Response } from 'express'
import request from 'supertest'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { errorHandler } from '../../middlewares/error-handler.js'

const mocks = vi.hoisted(() => ({
  findAll: vi.fn(),
}))

let userPermissions = ['audit:read']

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

vi.mock('./audit.service.js', () => ({
  AuditService: {
    findAll: mocks.findAll,
  },
}))

const { auditRoutes } = await import('./audit.routes.js')

function createTestApp() {
  const app = express()
  app.use(express.json())
  app.use('/audit-logs', auditRoutes)
  app.use(errorHandler)
  return app
}

const actorUserId = '019e9bc2-a9d6-74c9-adad-9cad76f1d9e1'

const sampleAuditLog = {
  id: '019e9bc2-a9d6-74c9-adad-9cad76f1d9f1',
  action: 'documents.create',
  entityType: 'document',
  entityId: '019e9bc2-aa31-7579-8b80-e9ed2450ecb3',
  metadata: { officeNumber: 'INM-AJ-001/2026' },
  ip: '127.0.0.1',
  userAgent: 'vitest',
  createdAt: '2026-06-02T10:00:00',
  actor: {
    id: actorUserId,
    username: 'admin',
    fullName: 'Administrador',
  },
}

const auditResponse = {
  items: [sampleAuditLog],
  page: 1,
  pageSize: 30,
  total: 1,
  totalPages: 1,
}

beforeEach(() => {
  userPermissions = ['audit:read']
  vi.clearAllMocks()
  mocks.findAll.mockResolvedValue(auditResponse)
})

describe('GET /audit-logs', () => {
  it('lista logs de auditoría', async () => {
    const app = createTestApp()

    const response = await request(app).get('/audit-logs')

    expect(response.status).toBe(200)
    expect(response.body.items).toEqual([
      expect.objectContaining({
        id: sampleAuditLog.id,
        action: sampleAuditLog.action,
        entityType: sampleAuditLog.entityType,
      }),
    ])
    expect(mocks.findAll).toHaveBeenCalledWith({
      action: undefined,
      actorUserId: undefined,
      dateFrom: undefined,
      dateTo: undefined,
      entityType: undefined,
      page: 1,
      pageSize: 30,
    })
  })

  it('aplica paginación', async () => {
    const app = createTestApp()

    const response = await request(app).get('/audit-logs?page=2&pageSize=10')

    expect(response.status).toBe(200)
    expect(mocks.findAll).toHaveBeenCalledWith(
      expect.objectContaining({
        page: 2,
        pageSize: 10,
      }),
    )
  })

  it('aplica filtros implementados', async () => {
    const app = createTestApp()

    const response = await request(app).get(
      `/audit-logs?action=documents.create&entityType=document&actorUserId=${actorUserId}&dateFrom=2026-06-01&dateTo=2026-06-30`,
    )

    expect(response.status).toBe(200)
    expect(mocks.findAll).toHaveBeenCalledWith({
      action: 'documents.create',
      entityType: 'document',
      actorUserId,
      dateFrom: new Date('2026-06-01'),
      dateTo: new Date('2026-06-30'),
      page: 1,
      pageSize: 30,
    })
  })

  it('rechaza errores de validación', async () => {
    const app = createTestApp()

    const response = await request(app).get(
      '/audit-logs?page=0&pageSize=101&actorUserId=invalid-id',
    )

    expect(response.status).toBe(400)
    expect(response.body.error.code).toBe('VALIDATION_ERROR')
    expect(mocks.findAll).not.toHaveBeenCalled()
  })

  it('devuelve 403 cuando falta audit:read', async () => {
    userPermissions = []
    const app = createTestApp()

    const response = await request(app).get('/audit-logs')

    expect(response.status).toBe(403)
    expect(response.body.error.code).toBe('FORBIDDEN')
    expect(mocks.findAll).not.toHaveBeenCalled()
  })

  it('permite usuarios con audit:read', async () => {
    const app = createTestApp()

    const response = await request(app).get('/audit-logs')

    expect(response.status).toBe(200)
    expect(mocks.findAll).toHaveBeenCalledOnce()
  })

  it('devuelve una lista vacía de forma consistente', async () => {
    mocks.findAll.mockResolvedValue({
      items: [],
      page: 1,
      pageSize: 30,
      total: 0,
      totalPages: 0,
    })
    const app = createTestApp()

    const response = await request(app).get('/audit-logs')

    expect(response.status).toBe(200)
    expect(response.body).toEqual({
      items: [],
      page: 1,
      pageSize: 30,
      total: 0,
      totalPages: 0,
    })
  })

  it('mantiene forma de respuesta paginada', async () => {
    const app = createTestApp()

    const response = await request(app).get('/audit-logs')

    expect(response.status).toBe(200)
    expect(response.body).toEqual({
      items: expect.any(Array),
      page: expect.any(Number),
      pageSize: expect.any(Number),
      total: expect.any(Number),
      totalPages: expect.any(Number),
    })
  })
})
