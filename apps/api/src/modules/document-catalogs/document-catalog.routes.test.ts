import express from 'express'
import type { NextFunction, Request, Response } from 'express'
import request from 'supertest'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { errorHandler } from '../../middlewares/error-handler.js'

const mocks = vi.hoisted(() => ({
  auditCreate: vi.fn(),
  findDocumentTypes: vi.fn(),
  findAllDocumentTypes: vi.fn(),
  findDocumentTypeById: vi.fn(),
  createDocumentType: vi.fn(),
  updateDocumentType: vi.fn(),
  setDocumentTypeActive: vi.fn(),
  findDocumentStatuses: vi.fn(),
  findAllDocumentStatuses: vi.fn(),
  findDocumentStatusById: vi.fn(),
  createDocumentStatus: vi.fn(),
  updateDocumentStatus: vi.fn(),
  setDocumentStatusActive: vi.fn(),
  findPhysicalLocations: vi.fn(),
  findAllPhysicalLocations: vi.fn(),
  findPhysicalLocationById: vi.fn(),
  createPhysicalLocation: vi.fn(),
  updatePhysicalLocation: vi.fn(),
  setPhysicalLocationActive: vi.fn(),
}))

let userPermissions = ['catalogs:read', 'catalogs:create', 'catalogs:update']

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

vi.mock('./document-catalog.model.js', () => ({
  DocumentCatalogModel: class {
    static findDocumentTypes = mocks.findDocumentTypes
    static findAllDocumentTypes = mocks.findAllDocumentTypes
    static findDocumentTypeById = mocks.findDocumentTypeById
    static createDocumentType = mocks.createDocumentType
    static updateDocumentType = mocks.updateDocumentType
    static setDocumentTypeActive = mocks.setDocumentTypeActive
    static findDocumentStatuses = mocks.findDocumentStatuses
    static findAllDocumentStatuses = mocks.findAllDocumentStatuses
    static findDocumentStatusById = mocks.findDocumentStatusById
    static createDocumentStatus = mocks.createDocumentStatus
    static updateDocumentStatus = mocks.updateDocumentStatus
    static setDocumentStatusActive = mocks.setDocumentStatusActive
    static findPhysicalLocations = mocks.findPhysicalLocations
    static findAllPhysicalLocations = mocks.findAllPhysicalLocations
    static findPhysicalLocationById = mocks.findPhysicalLocationById
    static createPhysicalLocation = mocks.createPhysicalLocation
    static updatePhysicalLocation = mocks.updatePhysicalLocation
    static setPhysicalLocationActive = mocks.setPhysicalLocationActive
  },
}))

const { documentCatalogRoutes } = await import('./document-catalog.routes.js')

function createTestApp() {
  const app = express()
  app.use(express.json())
  app.use(documentCatalogRoutes)
  app.use(errorHandler)
  return app
}

const sampleDocumentType = {
  id: '019e9bc2-a9cd-74e0-bcc6-89bd3dd7c001',
  code: 'OFICIO',
  name: 'Oficio',
  description: 'Documento oficial',
  isActive: true,
}

const sampleDocumentStatus = {
  id: '019e9bc2-a9d0-72f2-a385-2c5d1dd3310f',
  code: 'RECIBIDO',
  name: 'Recibido',
  description: 'Documento recibido',
  sortOrder: 1,
  isTerminal: false,
  isActive: true,
}

const samplePhysicalLocation = {
  id: '019e9bc2-a9d6-74c9-adad-9cad76f1d9a1',
  name: 'Archivo central',
  drawer: 'A-01',
  reference: 'Estante 1',
  isActive: true,
}

function mockDuplicateFailure(method: keyof typeof mocks) {
  mocks[method].mockRejectedValue(new Error('Duplicate entry'))
}

beforeEach(() => {
  userPermissions = ['catalogs:read', 'catalogs:create', 'catalogs:update']
  vi.clearAllMocks()
  vi.spyOn(console, 'error').mockImplementation(() => {})

  mocks.auditCreate.mockResolvedValue(undefined)

  mocks.findDocumentTypes.mockResolvedValue([sampleDocumentType])
  mocks.findAllDocumentTypes.mockResolvedValue([sampleDocumentType])
  mocks.findDocumentTypeById.mockResolvedValue(sampleDocumentType)
  mocks.createDocumentType.mockResolvedValue(sampleDocumentType)
  mocks.updateDocumentType.mockResolvedValue(sampleDocumentType)
  mocks.setDocumentTypeActive.mockResolvedValue(sampleDocumentType)

  mocks.findDocumentStatuses.mockResolvedValue([sampleDocumentStatus])
  mocks.findAllDocumentStatuses.mockResolvedValue([sampleDocumentStatus])
  mocks.findDocumentStatusById.mockResolvedValue(sampleDocumentStatus)
  mocks.createDocumentStatus.mockResolvedValue(sampleDocumentStatus)
  mocks.updateDocumentStatus.mockResolvedValue(sampleDocumentStatus)
  mocks.setDocumentStatusActive.mockResolvedValue(sampleDocumentStatus)

  mocks.findPhysicalLocations.mockResolvedValue([samplePhysicalLocation])
  mocks.findAllPhysicalLocations.mockResolvedValue([samplePhysicalLocation])
  mocks.findPhysicalLocationById.mockResolvedValue(samplePhysicalLocation)
  mocks.createPhysicalLocation.mockResolvedValue(samplePhysicalLocation)
  mocks.updatePhysicalLocation.mockResolvedValue(samplePhysicalLocation)
  mocks.setPhysicalLocationActive.mockResolvedValue(samplePhysicalLocation)
})

describe('document type catalog routes', () => {
  it('lista tipos de documento activos', async () => {
    const app = createTestApp()

    const response = await request(app).get('/document-types')

    expect(response.status).toBe(200)
    expect(response.body.items).toEqual([
      expect.objectContaining({
        id: sampleDocumentType.id,
        code: sampleDocumentType.code,
      }),
    ])
    expect(mocks.findDocumentTypes).toHaveBeenCalledOnce()
  })

  it('crea tipos de documento', async () => {
    const app = createTestApp()

    const response = await request(app).post('/document-types').send({
      code: 'MEMO',
      name: 'Memorándum',
      description: 'Documento oficial',
      isActive: true,
    })

    expect(response.status).toBe(201)
    expect(response.body.id).toBe(sampleDocumentType.id)
    expect(mocks.createDocumentType).toHaveBeenCalledWith({
      data: {
        code: 'MEMO',
        name: 'Memorándum',
        description: 'Documento oficial',
        isActive: true,
      },
    })
  })

  it('actualiza tipos de documento', async () => {
    const app = createTestApp()

    const response = await request(app)
      .put(`/document-types/${sampleDocumentType.id}`)
      .send({ name: 'Oficio actualizado' })

    expect(response.status).toBe(200)
    expect(response.body.id).toBe(sampleDocumentType.id)
    expect(mocks.updateDocumentType).toHaveBeenCalledWith({
      id: sampleDocumentType.id,
      data: { name: 'Oficio actualizado' },
    })
  })

  it('activa y desactiva tipos de documento', async () => {
    const app = createTestApp()

    const activateResponse = await request(app).patch(
      `/document-types/${sampleDocumentType.id}/activate`,
    )
    const deactivateResponse = await request(app).patch(
      `/document-types/${sampleDocumentType.id}/deactivate`,
    )

    expect(activateResponse.status).toBe(200)
    expect(deactivateResponse.status).toBe(200)
    expect(mocks.setDocumentTypeActive).toHaveBeenCalledWith({
      id: sampleDocumentType.id,
      isActive: true,
    })
    expect(mocks.setDocumentTypeActive).toHaveBeenCalledWith({
      id: sampleDocumentType.id,
      isActive: false,
    })
  })

  it('rechaza errores de validación en tipos de documento', async () => {
    const app = createTestApp()

    const response = await request(app).post('/document-types').send({
      code: 'A',
      name: '',
    })

    expect(response.status).toBe(400)
    expect(response.body.error.code).toBe('VALIDATION_ERROR')
    expect(mocks.createDocumentType).not.toHaveBeenCalled()
  })

  it('devuelve conflicto ante código duplicado en tipos de documento', async () => {
    mockDuplicateFailure('createDocumentType')
    const app = createTestApp()

    const response = await request(app).post('/document-types').send({
      code: 'OFICIO',
      name: 'Otro oficio',
    })

    expect(response.status).toBe(409)
    expect(response.body.error.code).toBe('DOCUMENT_TYPE_ALREADY_EXISTS')
  })

  it('devuelve conflicto ante nombre duplicado en tipos de documento', async () => {
    mockDuplicateFailure('createDocumentType')
    const app = createTestApp()

    const response = await request(app).post('/document-types').send({
      code: 'OFICIO_2',
      name: 'Oficio',
    })

    expect(response.status).toBe(409)
    expect(response.body.error.code).toBe('DOCUMENT_TYPE_ALREADY_EXISTS')
  })

  it('requiere permisos de catálogo para tipos de documento', async () => {
    userPermissions = []
    const app = createTestApp()

    const response = await request(app).get('/document-types')

    expect(response.status).toBe(403)
    expect(response.body.error.code).toBe('FORBIDDEN')
    expect(mocks.findDocumentTypes).not.toHaveBeenCalled()
  })
})

describe('document status catalog routes', () => {
  it('lista estatus de documento activos', async () => {
    const app = createTestApp()

    const response = await request(app).get('/document-statuses')

    expect(response.status).toBe(200)
    expect(response.body.items).toEqual([
      expect.objectContaining({
        id: sampleDocumentStatus.id,
        code: sampleDocumentStatus.code,
      }),
    ])
    expect(mocks.findDocumentStatuses).toHaveBeenCalledOnce()
  })

  it('crea estatus de documento', async () => {
    const app = createTestApp()

    const response = await request(app).post('/document-statuses').send({
      code: 'EN_REVISION',
      name: 'En revisión',
      description: 'Documento recibido',
      sortOrder: 1,
      isTerminal: false,
      isActive: true,
    })

    expect(response.status).toBe(201)
    expect(response.body.id).toBe(sampleDocumentStatus.id)
    expect(mocks.createDocumentStatus).toHaveBeenCalledWith({
      data: {
        code: 'EN_REVISION',
        name: 'En revisión',
        description: 'Documento recibido',
        sortOrder: 1,
        isTerminal: false,
        isActive: true,
      },
    })
  })

  it('actualiza estatus de documento', async () => {
    const app = createTestApp()

    const response = await request(app)
      .put(`/document-statuses/${sampleDocumentStatus.id}`)
      .send({ name: 'Recibido actualizado' })

    expect(response.status).toBe(200)
    expect(response.body.id).toBe(sampleDocumentStatus.id)
    expect(mocks.updateDocumentStatus).toHaveBeenCalledWith({
      id: sampleDocumentStatus.id,
      data: { name: 'Recibido actualizado' },
    })
  })

  it('activa y desactiva estatus de documento', async () => {
    const app = createTestApp()

    const activateResponse = await request(app).patch(
      `/document-statuses/${sampleDocumentStatus.id}/activate`,
    )
    const deactivateResponse = await request(app).patch(
      `/document-statuses/${sampleDocumentStatus.id}/deactivate`,
    )

    expect(activateResponse.status).toBe(200)
    expect(deactivateResponse.status).toBe(200)
    expect(mocks.setDocumentStatusActive).toHaveBeenCalledWith({
      id: sampleDocumentStatus.id,
      isActive: true,
    })
    expect(mocks.setDocumentStatusActive).toHaveBeenCalledWith({
      id: sampleDocumentStatus.id,
      isActive: false,
    })
  })

  it('rechaza errores de validación en estatus de documento', async () => {
    const app = createTestApp()

    const response = await request(app).post('/document-statuses').send({
      code: 'A',
      name: '',
      sortOrder: -1,
    })

    expect(response.status).toBe(400)
    expect(response.body.error.code).toBe('VALIDATION_ERROR')
    expect(mocks.createDocumentStatus).not.toHaveBeenCalled()
  })

  it('devuelve conflicto ante código duplicado en estatus de documento', async () => {
    mockDuplicateFailure('createDocumentStatus')
    const app = createTestApp()

    const response = await request(app).post('/document-statuses').send({
      code: 'RECIBIDO',
      name: 'Otro recibido',
      sortOrder: 1,
    })

    expect(response.status).toBe(409)
    expect(response.body.error.code).toBe('DOCUMENT_STATUS_ALREADY_EXISTS')
  })

  it('devuelve conflicto ante nombre duplicado en estatus de documento', async () => {
    mockDuplicateFailure('createDocumentStatus')
    const app = createTestApp()

    const response = await request(app).post('/document-statuses').send({
      code: 'RECIBIDO_2',
      name: 'Recibido',
      sortOrder: 1,
    })

    expect(response.status).toBe(409)
    expect(response.body.error.code).toBe('DOCUMENT_STATUS_ALREADY_EXISTS')
  })

  it('requiere permisos de catálogo para estatus de documento', async () => {
    userPermissions = []
    const app = createTestApp()

    const response = await request(app).get('/document-statuses')

    expect(response.status).toBe(403)
    expect(response.body.error.code).toBe('FORBIDDEN')
    expect(mocks.findDocumentStatuses).not.toHaveBeenCalled()
  })
})

describe('physical location catalog routes', () => {
  it('lista ubicaciones físicas activas', async () => {
    const app = createTestApp()

    const response = await request(app).get('/physical-locations')

    expect(response.status).toBe(200)
    expect(response.body.items).toEqual([
      expect.objectContaining({
        id: samplePhysicalLocation.id,
        name: samplePhysicalLocation.name,
      }),
    ])
    expect(mocks.findPhysicalLocations).toHaveBeenCalledOnce()
  })

  it('crea ubicaciones físicas', async () => {
    const app = createTestApp()

    const response = await request(app).post('/physical-locations').send({
      name: 'Archivo alterno',
      drawer: 'A-01',
      reference: 'Estante 1',
      isActive: true,
    })

    expect(response.status).toBe(201)
    expect(response.body.id).toBe(samplePhysicalLocation.id)
    expect(mocks.createPhysicalLocation).toHaveBeenCalledWith({
      data: {
        name: 'Archivo alterno',
        drawer: 'A-01',
        reference: 'Estante 1',
        isActive: true,
      },
    })
  })

  it('actualiza ubicaciones físicas', async () => {
    const app = createTestApp()

    const response = await request(app)
      .put(`/physical-locations/${samplePhysicalLocation.id}`)
      .send({ name: 'Archivo actualizado' })

    expect(response.status).toBe(200)
    expect(response.body.id).toBe(samplePhysicalLocation.id)
    expect(mocks.updatePhysicalLocation).toHaveBeenCalledWith({
      id: samplePhysicalLocation.id,
      data: { name: 'Archivo actualizado' },
    })
  })

  it('activa y desactiva ubicaciones físicas', async () => {
    const app = createTestApp()

    const activateResponse = await request(app).patch(
      `/physical-locations/${samplePhysicalLocation.id}/activate`,
    )
    const deactivateResponse = await request(app).patch(
      `/physical-locations/${samplePhysicalLocation.id}/deactivate`,
    )

    expect(activateResponse.status).toBe(200)
    expect(deactivateResponse.status).toBe(200)
    expect(mocks.setPhysicalLocationActive).toHaveBeenCalledWith({
      id: samplePhysicalLocation.id,
      isActive: true,
    })
    expect(mocks.setPhysicalLocationActive).toHaveBeenCalledWith({
      id: samplePhysicalLocation.id,
      isActive: false,
    })
  })

  it('rechaza errores de validación en ubicaciones físicas', async () => {
    const app = createTestApp()

    const response = await request(app).post('/physical-locations').send({
      name: '',
      drawer: 'A'.repeat(101),
    })

    expect(response.status).toBe(400)
    expect(response.body.error.code).toBe('VALIDATION_ERROR')
    expect(mocks.createPhysicalLocation).not.toHaveBeenCalled()
  })

  it('devuelve conflicto ante nombre duplicado en ubicaciones físicas', async () => {
    mockDuplicateFailure('createPhysicalLocation')
    const app = createTestApp()

    const response = await request(app).post('/physical-locations').send({
      name: 'Archivo central',
    })

    expect(response.status).toBe(409)
    expect(response.body.error.code).toBe('PHYSICAL_LOCATION_ALREADY_EXISTS')
  })

  it('requiere permisos de catálogo para ubicaciones físicas', async () => {
    userPermissions = []
    const app = createTestApp()

    const response = await request(app).get('/physical-locations')

    expect(response.status).toBe(403)
    expect(response.body.error.code).toBe('FORBIDDEN')
    expect(mocks.findPhysicalLocations).not.toHaveBeenCalled()
  })
})
