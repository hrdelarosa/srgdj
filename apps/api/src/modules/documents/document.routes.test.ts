import express from 'express'
import type { NextFunction, Request, Response } from 'express'
import request from 'supertest'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { errorHandler } from '../../middlewares/error-handler.js'
import type { DocumentListItem, PaginatedResponse } from '@srgdj/shared'

const findAllMock = vi.fn()
const findByIdMock = vi.fn()
const findByOfficeNumberMock = vi.fn()
const createMock = vi.fn()
const updateMock = vi.fn()
const deleteMock = vi.fn()
const removeMock = vi.fn()
const findEventsByDocumentIdMock = vi.fn()
const createEventMock = vi.fn()
let userPermissions = [
  'documents:create',
  'documents:read',
  'documents:update',
  'documents:delete',
  'documents:events:create',
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
    create: vi.fn(),
  },
}))

vi.mock('./document.model.js', () => ({
  DocumentModel: class {
    static findAll = findAllMock
    static findById = findByIdMock
    static findByOfficeNumber = findByOfficeNumberMock
    static create = createMock
    static update = updateMock
    static delete = deleteMock
    static remove = removeMock
    static findEventsByDocumentId = findEventsByDocumentIdMock
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

const validDocumentPayload = {
  officeNumber: 'INM-AJ-002/2026',
  caseNumber: 'EXP-002/2026',
  actor: 'María López',
  defendant: 'INM',
  documentTypeId: sampleDocument.documentType.id,
  officeDate: '2026-06-01',
  receivedDate: '2026-06-02',
  annexes: '2 anexos',
  physicalLocationId: '',
  currentStatusId: sampleDocument.currentStatus.id,
  observations: 'Alta inicial',
}

const createdDocument = {
  ...sampleDocument,
  id: '019e9bc2-aa31-7579-8b80-e9ed2450ecb5',
  officeNumber: validDocumentPayload.officeNumber,
  caseNumber: validDocumentPayload.caseNumber,
  actor: validDocumentPayload.actor,
  defendant: validDocumentPayload.defendant,
}

const sampleEvent = {
  id: '019e9bc2-aa31-7579-8b80-e9ed2450ecb4',
  documentId: sampleDocument.id,
  eventType: 'NOTE_ADDED',
  fromStatusId: null,
  toStatusId: null,
  note: 'Seguimiento registrado',
  metadata: {},
  createdBy: '019e9bc2-a9d6-74c9-adad-9cad76f1d9e1',
  createdAt: new Date('2026-06-02'),
}

beforeEach(() => {
  userPermissions = [
    'documents:create',
    'documents:read',
    'documents:update',
    'documents:delete',
    'documents:events:create',
  ]
})

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

  it('acepta ordenamiento personalizado', async () => {
    const app = createTestApp()

    const response = await request(app).get(
      '/documents?sortBy=officeDate&sortOrder=asc',
    )

    expect(response.status).toBe(200)
    expect(findAllMock).toHaveBeenCalledWith(
      expect.objectContaining({
        sortBy: 'officeDate',
        sortOrder: 'asc',
      }),
    )
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

describe('POST /documents', () => {
  beforeEach(() => {
    findByOfficeNumberMock.mockReset()
    createMock.mockReset()
    findByOfficeNumberMock.mockResolvedValue(null)
    createMock.mockResolvedValue(createdDocument)
  })

  it('crea documentos con datos válidos', async () => {
    const app = createTestApp()

    const response = await request(app)
      .post('/documents')
      .send(validDocumentPayload)

    expect(response.status).toBe(201)
    expect(response.body).toEqual(
      expect.objectContaining({
        id: createdDocument.id,
        officeNumber: validDocumentPayload.officeNumber,
      }),
    )
    expect(findByOfficeNumberMock).toHaveBeenCalledWith({
      officeNumber: validDocumentPayload.officeNumber,
    })
    expect(createMock).toHaveBeenCalledWith({
      document: expect.objectContaining({
        officeNumber: validDocumentPayload.officeNumber,
        userId: '019e9bc2-a9d6-74c9-adad-9cad76f1d9e1',
      }),
    })
  })

  it('rechaza errores de validación al crear documentos', async () => {
    const app = createTestApp()

    const response = await request(app).post('/documents').send({
      ...validDocumentPayload,
      officeNumber: '',
      receivedDate: 'fecha-invalida',
    })

    expect(response.status).toBe(400)
    expect(response.body.error.code).toBe('VALIDATION_ERROR')
    expect(createMock).not.toHaveBeenCalled()
  })

  it('rechaza officeNumber duplicado', async () => {
    findByOfficeNumberMock.mockResolvedValue(sampleDocument)
    const app = createTestApp()

    const response = await request(app)
      .post('/documents')
      .send(validDocumentPayload)

    expect(response.status).toBe(400)
    expect(response.body.error.code).toBe('DOCUMENT_ALREADY_EXISTS')
    expect(createMock).not.toHaveBeenCalled()
  })
})

describe('GET /documents/:id', () => {
  beforeEach(() => {
    findByIdMock.mockReset()
  })

  it('devuelve el detalle del documento por id', async () => {
    findByIdMock.mockResolvedValue(sampleDocument)
    const app = createTestApp()

    const response = await request(app).get(`/documents/${sampleDocument.id}`)

    expect(response.status).toBe(200)
    expect(response.body).toEqual(
      expect.objectContaining({
        id: sampleDocument.id,
        officeNumber: sampleDocument.officeNumber,
      }),
    )
    expect(findByIdMock).toHaveBeenCalledWith({ id: sampleDocument.id })
  })

  it('devuelve 404 cuando el documento no existe', async () => {
    findByIdMock.mockResolvedValue(null)
    const app = createTestApp()

    const response = await request(app).get(`/documents/${sampleDocument.id}`)

    expect(response.status).toBe(404)
    expect(response.body.error.code).toBe('DOCUMENT_NOT_FOUND')
  })
})

describe('PATCH /documents/:id', () => {
  beforeEach(() => {
    updateMock.mockReset()
    updateMock.mockResolvedValue(sampleDocument)
  })

  it('actualiza documentos con datos válidos', async () => {
    const app = createTestApp()

    const response = await request(app)
      .patch(`/documents/${sampleDocument.id}`)
      .send({ observations: 'Actualización' })

    expect(response.status).toBe(200)
    expect(response.body).toEqual(
      expect.objectContaining({
        id: sampleDocument.id,
        officeNumber: sampleDocument.officeNumber,
      }),
    )
    expect(updateMock).toHaveBeenCalledWith({
      id: sampleDocument.id,
      document: {
        observations: 'Actualización',
        userId: '019e9bc2-a9d6-74c9-adad-9cad76f1d9e1',
      },
    })
  })

  it('rechaza errores de validación al actualizar documentos', async () => {
    const app = createTestApp()

    const response = await request(app)
      .patch(`/documents/${sampleDocument.id}`)
      .send({ receivedDate: 'fecha-invalida' })

    expect(response.status).toBe(400)
    expect(response.body.error.code).toBe('VALIDATION_ERROR')
    expect(updateMock).not.toHaveBeenCalled()
  })

  it('devuelve 404 cuando el documento no existe o fue eliminado', async () => {
    updateMock.mockResolvedValue(null)
    const app = createTestApp()

    const response = await request(app)
      .patch(`/documents/${sampleDocument.id}`)
      .send({ observations: 'Actualización' })

    expect(response.status).toBe(404)
    expect(response.body.error.code).toBe('DOCUMENT_NOT_FOUND')
  })
})

describe('PATCH /documents/delete/:id', () => {
  beforeEach(() => {
    deleteMock.mockReset()
    deleteMock.mockResolvedValue(true)
  })

  it('elimina documentos de forma lógica', async () => {
    const app = createTestApp()

    const response = await request(app).patch(
      `/documents/delete/${sampleDocument.id}`,
    )

    expect(response.status).toBe(204)
    expect(deleteMock).toHaveBeenCalledWith({
      id: sampleDocument.id,
      userId: '019e9bc2-a9d6-74c9-adad-9cad76f1d9e1',
    })
  })
})

describe('soft-deleted documents', () => {
  beforeEach(() => {
    findAllMock.mockReset()
    findByIdMock.mockReset()
    updateMock.mockReset()
    findEventsByDocumentIdMock.mockReset()
    createEventMock.mockReset()

    findAllMock.mockResolvedValue({
      items: [],
      page: 1,
      pageSize: 30,
      total: 0,
      totalPages: 0,
    })
    findByIdMock.mockResolvedValue(null)
    updateMock.mockResolvedValue(null)
    findEventsByDocumentIdMock.mockResolvedValue([])
    createEventMock.mockResolvedValue(null)
  })

  it('excluye documentos eliminados de lista, detalle, actualización y eventos', async () => {
    const app = createTestApp()

    const listResponse = await request(app).get('/documents')
    const detailResponse = await request(app).get(
      `/documents/${sampleDocument.id}`,
    )
    const updateResponse = await request(app)
      .patch(`/documents/${sampleDocument.id}`)
      .send({ observations: 'No debería actualizar' })
    const eventsResponse = await request(app).get(
      `/documents/${sampleDocument.id}/events`,
    )
    const createEventResponse = await request(app)
      .post(`/documents/${sampleDocument.id}/events`)
      .send({ eventType: 'NOTE_ADDED', note: 'No debería registrar' })

    expect(listResponse.status).toBe(200)
    expect(listResponse.body.items).toEqual([])
    expect(detailResponse.status).toBe(404)
    expect(detailResponse.body.error.code).toBe('DOCUMENT_NOT_FOUND')
    expect(updateResponse.status).toBe(404)
    expect(updateResponse.body.error.code).toBe('DOCUMENT_NOT_FOUND')
    expect(eventsResponse.status).toBe(200)
    expect(eventsResponse.body.items).toEqual([])
    expect(createEventResponse.status).toBe(404)
    expect(createEventResponse.body.error.code).toBe('DOCUMENT_NOT_FOUND')
  })
})

describe('DELETE /documents/remove/:id', () => {
  beforeEach(() => {
    removeMock.mockReset()
    removeMock.mockResolvedValue(true)
  })

  it('no permite hard delete con solo documents:delete', async () => {
    const app = createTestApp()

    const response = await request(app).delete(
      `/documents/remove/${sampleDocument.id}`,
    )

    expect(response.status).toBe(403)
    expect(response.body.error.code).toBe('FORBIDDEN')
    expect(removeMock).not.toHaveBeenCalled()
  })

  it('permite hard delete con documents:remove', async () => {
    userPermissions = [...userPermissions, 'documents:remove']
    const app = createTestApp()

    const response = await request(app).delete(
      `/documents/remove/${sampleDocument.id}`,
    )

    expect(response.status).toBe(204)
    expect(removeMock).toHaveBeenCalledWith({ id: sampleDocument.id })
  })
})

describe('GET /documents/:id/events', () => {
  beforeEach(() => {
    findEventsByDocumentIdMock.mockReset()
    findEventsByDocumentIdMock.mockResolvedValue([sampleEvent])
  })

  it('lista eventos del documento', async () => {
    const app = createTestApp()

    const response = await request(app).get(
      `/documents/${sampleDocument.id}/events`,
    )

    expect(response.status).toBe(200)
    expect(response.body.items).toEqual([
      expect.objectContaining({
        id: sampleEvent.id,
        documentId: sampleDocument.id,
        eventType: 'NOTE_ADDED',
      }),
    ])
    expect(findEventsByDocumentIdMock).toHaveBeenCalledWith({
      id: sampleDocument.id,
    })
  })
})

describe('POST /documents/:id/events', () => {
  beforeEach(() => {
    createEventMock.mockReset()
    createEventMock.mockResolvedValue(sampleEvent)
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

  it('rechaza errores de validación al crear eventos', async () => {
    const app = createTestApp()

    const response = await request(app)
      .post(`/documents/${sampleDocument.id}/events`)
      .send({ eventType: 'INVALID_EVENT' })

    expect(response.status).toBe(400)
    expect(response.body.error.code).toBe('VALIDATION_ERROR')
    expect(createEventMock).not.toHaveBeenCalled()
  })
})
