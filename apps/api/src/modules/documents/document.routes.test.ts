import express from 'express'
import type { NextFunction, Request, Response } from 'express'
import request from 'supertest'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { errorHandler } from '../../middlewares/error-handler.js'
import type { DocumentListItem, PaginatedResponse } from '@srgdj/shared'

const findAllMock = vi.fn()
const findByIdMock = vi.fn()
const createEventMock = vi.fn()

vi.mock('../../middlewares/require-auth.js', () => ({
  requireAuth: (req: Request, _res: Response, next: NextFunction) => {
    req.user = {
      id: '019e9bc2-a9d6-74c9-adad-9cad76f1d9e1',
      username: 'admin',
      role: {
        id: '019e9bc2-a9d6-74c9-adad-9cad76f1d9e2',
        code: 'ADMIN',
        name: 'Administrador',
      },
      permissions: [
        'documents:create',
        'documents:read',
        'documents:update',
        'documents:delete',
        'documents:events:create',
      ],
    }
    next()
  },
}))

vi.mock('../auth/require-permission.js', () => ({
  requirePermission:
    () => (_req: Request, _res: Response, next: NextFunction) =>
      next(),
}))

vi.mock('../audit/audit.service.js', () => ({
  AuditService: {
    create: vi.fn(),
  },
}))

vi.mock('./document.model.js', () => ({
  DocumentModel: class {
    static findAll = findAllMock
    static findById = findByIdMock
    static create = vi.fn()
    static update = vi.fn()
    static delete = vi.fn()
    static remove = vi.fn()
    static createEvent = createEventMock
  },
}))

const { documentRoutes } = await import('./document.routes.js')

function createTestApp() {
  const app = express()
  app.use(express.json())
  app.use('/documents', documentRoutes)
  app.use(errorHandler)
  return app
}

const sampleDocument: DocumentListItem = {
  id: '019e9bc2-aa31-7579-8b80-e9ed2450ecb3',
  officeNumber: 'INM-AJ-001/2026',
  caseNumber: 'EXP-001/2026',
  actor: 'Juan Pérez',
  defendant: 'INM',
  officeDate: new Date('2026-06-01'),
  receivedDate: new Date('2026-06-02'),
  annexes: null,
  observations: null,
  createdAt: new Date('2026-06-02'),
  updatedAt: new Date('2026-06-02'),
  documentType: {
    id: '019e9bc2-a9cd-74e0-bcc6-89bd3dd7c001',
    code: 'OFICIO',
    name: 'Oficio',
  },
  currentStatus: {
    id: '019e9bc2-a9d0-72f2-a385-2c5d1dd3310f',
    code: 'RECIBIDO',
    name: 'Recibido',
  },
  physicalLocation: null,
  createdBy: {
    id: '019e9bc2-a9d6-74c9-adad-9cad76f1d9e1',
    name: 'admin',
    fullName: 'Administrador',
  },
}

const paginatedResponse: PaginatedResponse<DocumentListItem> = {
  items: [sampleDocument],
  page: 1,
  pageSize: 30,
  total: 1,
  totalPages: 1,
}

describe('GET /documents', () => {
  beforeEach(() => {
    findAllMock.mockReset()
    findAllMock.mockResolvedValue(paginatedResponse)
  })

  it('devuelve documentos paginados con valores por defecto', async () => {
    const app = createTestApp()

    const response = await request(app).get('/documents')

    expect(response.status).toBe(200)
    expect(response.body).toEqual({
      items: [
        expect.objectContaining({
          id: sampleDocument.id,
          officeNumber: sampleDocument.officeNumber,
        }),
      ],
      page: 1,
      pageSize: 30,
      total: 1,
      totalPages: 1,
    })
    expect(findAllMock).toHaveBeenCalledWith({
      page: 1,
      pageSize: 30,
      q: undefined,
      currentStatusId: undefined,
      documentTypeId: undefined,
      officeNumber: undefined,
      caseNumber: undefined,
      actor: undefined,
      defendant: undefined,
      receivedDateFrom: undefined,
      receivedDateTo: undefined,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    })
  })

  it('acepta paginación personalizada', async () => {
    const app = createTestApp()

    const response = await request(app).get('/documents?page=2&pageSize=10')

    expect(response.status).toBe(200)
    expect(findAllMock).toHaveBeenCalledWith({
      page: 2,
      pageSize: 10,
      q: undefined,
      currentStatusId: undefined,
      documentTypeId: undefined,
      officeNumber: undefined,
      caseNumber: undefined,
      actor: undefined,
      defendant: undefined,
      receivedDateFrom: undefined,
      receivedDateTo: undefined,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    })
  })

  it('acepta búsqueda por texto', async () => {
    const app = createTestApp()

    const response = await request(app).get('/documents?q=INM')

    expect(response.status).toBe(200)
    expect(findAllMock).toHaveBeenCalledWith({
      page: 1,
      pageSize: 30,
      q: 'INM',
      currentStatusId: undefined,
      documentTypeId: undefined,
      officeNumber: undefined,
      caseNumber: undefined,
      actor: undefined,
      defendant: undefined,
      receivedDateFrom: undefined,
      receivedDateTo: undefined,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    })
  })

  it('acepta filtros por estatus y tipo de documento', async () => {
    const app = createTestApp()
    const statusId = '019e9bc2-a9d0-72f2-a385-2c5d1dd3310f'
    const documentTypeId = '019e9bc2-a9cd-74e0-bcc6-89bd3dd7c001'

    const response = await request(app).get(
      `/documents?currentStatusId=${statusId}&documentTypeId=${documentTypeId}`,
    )

    expect(response.status).toBe(200)
    expect(findAllMock).toHaveBeenCalledWith({
      page: 1,
      pageSize: 30,
      q: undefined,
      currentStatusId: statusId,
      documentTypeId,
      officeNumber: undefined,
      caseNumber: undefined,
      actor: undefined,
      defendant: undefined,
      receivedDateFrom: undefined,
      receivedDateTo: undefined,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    })
  })

  it('rechaza page menor a 1', async () => {
    const app = createTestApp()

    const response = await request(app).get('/documents?page=0')

    expect(response.status).toBe(400)
    expect(response.body.error.code).toBe('VALIDATION_ERROR')
    expect(findAllMock).not.toHaveBeenCalled()
  })

  it('rechaza pageSize mayor a 100', async () => {
    const app = createTestApp()

    const response = await request(app).get('/documents?pageSize=101')

    expect(response.status).toBe(400)
    expect(response.body.error.code).toBe('VALIDATION_ERROR')
    expect(findAllMock).not.toHaveBeenCalled()
  })

  it('rechaza statusId que excede la longitud máxima', async () => {
    const app = createTestApp()
    const statusId = 'a'.repeat(37)

    const response = await request(app).get(
      `/documents?currentStatusId=${statusId}`,
    )

    expect(response.status).toBe(400)
    expect(response.body.error.code).toBe('VALIDATION_ERROR')
    expect(findAllMock).not.toHaveBeenCalled()
  })
})

describe('POST /documents/:id/events', () => {
  beforeEach(() => {
    createEventMock.mockReset()
    createEventMock.mockResolvedValue({
      id: '019e9bc2-aa31-7579-8b80-e9ed2450ecb4',
      documentId: sampleDocument.id,
      eventType: 'NOTE_ADDED',
      fromStatusId: null,
      toStatusId: null,
      note: 'Seguimiento registrado',
      metadata: {},
      createdBy: '019e9bc2-a9d6-74c9-adad-9cad76f1d9e1',
      createdAt: new Date('2026-06-02'),
    })
  })

  it('registra eventos con el usuario autenticado', async () => {
    const app = createTestApp()

    const response = await request(app)
      .post(`/documents/${sampleDocument.id}/events`)
      .send({
        eventType: 'NOTE_ADDED',
        note: 'Seguimiento registrado',
      })

    expect(response.status).toBe(201)
    expect(createEventMock).toHaveBeenCalledWith({
      id: sampleDocument.id,
      data: {
        eventType: 'NOTE_ADDED',
        note: 'Seguimiento registrado',
      },
      userId: '019e9bc2-a9d6-74c9-adad-9cad76f1d9e1',
    })
  })
})
