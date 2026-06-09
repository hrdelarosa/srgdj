import express from 'express'
import request from 'supertest'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { errorHandler } from '../../middlewares/error-handler.js'
import type { DocumentListItem, PaginatedResponse } from '@srgdj/shared'

const findAllMock = vi.fn()
const findByIdMock = vi.fn()

vi.mock('./document.model.js', () => ({
  DocumentModel: class {
    static findAll = findAllMock
    static findById = findByIdMock
    static create = vi.fn()
    static update = vi.fn()
    static delete = vi.fn()
    static remove = vi.fn()
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
    fullname: 'Administrador',
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
      query: undefined,
      statusId: undefined,
      documentTypeId: undefined,
    })
  })

  it('acepta paginación personalizada', async () => {
    const app = createTestApp()

    const response = await request(app).get('/documents?page=2&pageSize=10')

    expect(response.status).toBe(200)
    expect(findAllMock).toHaveBeenCalledWith({
      page: 2,
      pageSize: 10,
      query: undefined,
      statusId: undefined,
      documentTypeId: undefined,
    })
  })

  it('acepta búsqueda por texto', async () => {
    const app = createTestApp()

    const response = await request(app).get('/documents?query=INM')

    expect(response.status).toBe(200)
    expect(findAllMock).toHaveBeenCalledWith({
      page: 1,
      pageSize: 30,
      query: 'INM',
      statusId: undefined,
      documentTypeId: undefined,
    })
  })

  it('acepta filtros por estatus y tipo de documento', async () => {
    const app = createTestApp()
    const statusId = '019e9bc2-a9d0-72f2-a385-2c5d1dd3310f'
    const documentTypeId = '019e9bc2-a9cd-74e0-bcc6-89bd3dd7c001'

    const response = await request(app).get(
      `/documents?statusId=${statusId}&documentTypeId=${documentTypeId}`,
    )

    expect(response.status).toBe(200)
    expect(findAllMock).toHaveBeenCalledWith({
      page: 1,
      pageSize: 30,
      query: undefined,
      statusId,
      documentTypeId,
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

    const response = await request(app).get(`/documents?statusId=${statusId}`)

    expect(response.status).toBe(400)
    expect(response.body.error.code).toBe('VALIDATION_ERROR')
    expect(findAllMock).not.toHaveBeenCalled()
  })
})
