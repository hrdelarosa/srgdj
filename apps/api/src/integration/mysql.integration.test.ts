import argon2 from 'argon2'
import { and, eq, isNull, sql } from 'drizzle-orm'
import type express from 'express'
import request from 'supertest'
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
} from 'vitest'

import {
  clearMysqlDatabase,
  createDisposableMysqlDatabase,
} from './mysql-test-db.js'

const integrationDatabaseUrl = process.env.INTEGRATION_DATABASE_URL
const describeIfMysql = integrationDatabaseUrl ? describe.sequential : describe.skip

const ids = {
  adminRole: '00000000-0000-4000-8000-000000000001',
  limitedRole: '00000000-0000-4000-8000-000000000002',
  adminUser: '00000000-0000-4000-8000-000000000003',
  limitedUser: '00000000-0000-4000-8000-000000000004',
  documentType: '00000000-0000-4000-8000-000000000005',
  statusReceived: '00000000-0000-4000-8000-000000000006',
  statusClosed: '00000000-0000-4000-8000-000000000007',
  location: '00000000-0000-4000-8000-000000000008',
  seededDocument: '00000000-0000-4000-8000-000000000009',
  removableDocument: '00000000-0000-4000-8000-000000000010',
  transactionType: '00000000-0000-4000-8000-000000000011',
}

const permissionsToSeed = [
  'documents:create',
  'documents:read',
  'documents:update',
  'documents:delete',
  'documents:remove',
  'documents:events:create',
  'catalogs:create',
  'catalogs:read',
  'catalogs:update',
  'audit:read',
]

type TestContext = {
  app: express.Express
  db: typeof import('../database/db.js').db
  schema: typeof import('../database/schema.js')
  resetLoginRateLimit: typeof import('../modules/auth/login-rate-limit.js').resetLoginRateLimit
  database?: Awaited<ReturnType<typeof createDisposableMysqlDatabase>>
}

const context: TestContext = {} as TestContext

function getRefreshCookie(response: request.Response) {
  const setCookie = response.headers['set-cookie']
  const cookies = Array.isArray(setCookie) ? setCookie : [setCookie]
  const refreshCookie = cookies.find((cookie) =>
    cookie?.startsWith('srgdj_refresh_token='),
  )

  if (!refreshCookie) throw new Error('Refresh cookie was not set')

  return refreshCookie.split(';')[0]
}

async function login(username = 'admin', password = 'Admin123*') {
  const response = await request(context.app)
    .post('/api/v1/auth/login')
    .send({ username, password })

  return {
    response,
    accessToken: response.body.accessToken as string,
    refreshCookie: response.status === 200 ? getRefreshCookie(response) : '',
  }
}

function auth(token: string) {
  return `Bearer ${token}`
}

function validDocumentPayload(officeNumber: string) {
  return {
    officeNumber,
    caseNumber: `EXP-${officeNumber}`,
    actor: 'Persona actora',
    defendant: 'Institución demandada',
    documentTypeId: ids.documentType,
    officeDate: '2026-06-01',
    receivedDate: '2026-06-02',
    annexes: 'Anexo único',
    physicalLocationId: ids.location,
    currentStatusId: ids.statusReceived,
    observations: 'Alta desde integración',
  }
}

async function seedDatabase() {
  const { db, schema } = context
  const passwordHash = await argon2.hash('Admin123*')
  const permissions = permissionsToSeed.map((code, index) => ({
    id: `10000000-0000-4000-8000-${String(index + 1).padStart(12, '0')}`,
    code,
    name: code,
    isSystem: true,
    isActive: true,
  }))

  await db.insert(schema.roles).values([
    {
      id: ids.adminRole,
      code: 'ADMIN',
      name: 'Administrador',
      isActive: true,
    },
    {
      id: ids.limitedRole,
      code: 'LIMITED',
      name: 'Usuario limitado',
      isActive: true,
    },
  ])

  await db.insert(schema.permissions).values(permissions)
  await db.insert(schema.rolePermissions).values(
    permissions.map((permission) => ({
      roleId: ids.adminRole,
      permissionId: permission.id,
    })),
  )
  await db.insert(schema.rolePermissions).values([
    {
      roleId: ids.limitedRole,
      permissionId: permissions.find(
        (permission) => permission.code === 'documents:read',
      )!.id,
    },
  ])

  await db.insert(schema.users).values([
    {
      id: ids.adminUser,
      username: 'admin',
      passwordHash,
      fullName: 'Usuario Administrador',
      roleId: ids.adminRole,
      isActive: true,
      mustChangePassword: false,
    },
    {
      id: ids.limitedUser,
      username: 'limited',
      passwordHash,
      fullName: 'Usuario Limitado',
      roleId: ids.limitedRole,
      isActive: true,
      mustChangePassword: false,
    },
  ])

  await db.insert(schema.documentTypes).values({
    id: ids.documentType,
    code: 'OFICIO',
    name: 'Oficio',
    isActive: true,
  })
  await db.insert(schema.documentStatuses).values([
    {
      id: ids.statusReceived,
      code: 'RECIBIDO',
      name: 'Recibido',
      sortOrder: 1,
      isTerminal: false,
      isActive: true,
    },
    {
      id: ids.statusClosed,
      code: 'CONCLUIDO',
      name: 'Concluido',
      sortOrder: 2,
      isTerminal: true,
      isActive: true,
    },
  ])
  await db.insert(schema.physicalLocations).values({
    id: ids.location,
    name: 'Archivo jurídico',
    drawer: 'Gaveta 1',
    reference: 'Integración',
    isActive: true,
  })
  await db.insert(schema.documents).values([
    {
      id: ids.seededDocument,
      officeNumber: 'INT-001/2026',
      caseNumber: 'EXP-001/2026',
      actor: 'Ana Integración',
      defendant: 'Institución',
      documentTypeId: ids.documentType,
      officeDate: new Date('2026-06-01'),
      receivedDate: new Date('2026-06-02'),
      physicalLocationId: ids.location,
      currentStatusId: ids.statusReceived,
      createdBy: ids.adminUser,
      updatedBy: ids.adminUser,
    },
    {
      id: ids.removableDocument,
      officeNumber: 'INT-REMOVE/2026',
      caseNumber: 'EXP-REMOVE/2026',
      actor: 'Removible',
      defendant: 'Institución',
      documentTypeId: ids.documentType,
      receivedDate: new Date('2026-06-03'),
      physicalLocationId: ids.location,
      currentStatusId: ids.statusReceived,
      createdBy: ids.adminUser,
      updatedBy: ids.adminUser,
    },
  ])
}

describeIfMysql('MySQL integration behavior', () => {
  beforeAll(async () => {
    process.env.JWT_SECRET = 'integration-secret'
    process.env.JWT_EXPIRES_IN = '15m'
    process.env.REFRESH_TOKEN_DAYS = '7'
    process.env.SESSION_INACTIVITY_MINUTES = '30'
    process.env.LOGIN_RATE_LIMIT_MAX_ATTEMPTS = '100'
    process.env.LOGIN_RATE_LIMIT_WINDOW_MS = '60000'

    context.database = await createDisposableMysqlDatabase(
      integrationDatabaseUrl!,
    )
    process.env.DATABASE_URL = context.database.databaseUrl

    const [{ app }, { db }, schema, { resetLoginRateLimit }] =
      await Promise.all([
        import('../app.js'),
        import('../database/db.js'),
        import('../database/schema.js'),
        import('../modules/auth/login-rate-limit.js'),
      ])

    context.app = app
    context.db = db
    context.schema = schema
    context.resetLoginRateLimit = resetLoginRateLimit
  })

  beforeEach(async () => {
    context.resetLoginRateLimit()
    await clearMysqlDatabase(context.database!.connection)
    await seedDatabase()
  })

  afterAll(async () => {
    await context.database?.drop()
  })

  it('authenticates, rotates refresh tokens, and rejects a revoked logout session', async () => {
    const loginResult = await login()

    expect(loginResult.response.status).toBe(200)
    expect(loginResult.response.body.user).toMatchObject({
      id: ids.adminUser,
      username: 'admin',
      permissions: expect.arrayContaining(['documents:read', 'audit:read']),
    })

    const meResponse = await request(context.app)
      .get('/api/v1/auth/me')
      .set('Authorization', auth(loginResult.accessToken))

    expect(meResponse.status).toBe(200)
    expect(meResponse.body.user.id).toBe(ids.adminUser)

    const refreshResponse = await request(context.app)
      .post('/api/v1/auth/refresh')
      .set('Cookie', loginResult.refreshCookie)

    expect(refreshResponse.status).toBe(200)
    expect(refreshResponse.body.accessToken).toEqual(expect.any(String))
    const rotatedRefreshCookie = getRefreshCookie(refreshResponse)
    expect(rotatedRefreshCookie).not.toBe(loginResult.refreshCookie)

    const reusedRefreshResponse = await request(context.app)
      .post('/api/v1/auth/refresh')
      .set('Cookie', loginResult.refreshCookie)

    expect(reusedRefreshResponse.status).toBe(401)
    expect(reusedRefreshResponse.body.error.code).toBe('INVALID_SESSION')

    const logoutResponse = await request(context.app)
      .post('/api/v1/auth/logout')
      .set('Authorization', auth(refreshResponse.body.accessToken))

    expect(logoutResponse.status).toBe(204)

    const refreshAfterLogoutResponse = await request(context.app)
      .post('/api/v1/auth/refresh')
      .set('Cookie', rotatedRefreshCookie)

    expect(refreshAfterLogoutResponse.status).toBe(401)
    expect(refreshAfterLogoutResponse.body.error.code).toBe('INVALID_SESSION')
  })

  it('enforces authentication and route permissions with real sessions', async () => {
    const unauthenticatedResponse = await request(context.app).get(
      '/api/v1/documents',
    )

    expect(unauthenticatedResponse.status).toBe(401)
    expect(unauthenticatedResponse.body.error.code).toBe('UNAUTHORIZED')

    const limitedLogin = await login('limited')
    const forbiddenResponse = await request(context.app)
      .get('/api/v1/audit-logs')
      .set('Authorization', auth(limitedLogin.accessToken))

    expect(forbiddenResponse.status).toBe(403)
    expect(forbiddenResponse.body.error.code).toBe('FORBIDDEN')

    const adminLogin = await login()
    const allowedResponse = await request(context.app)
      .get('/api/v1/audit-logs')
      .set('Authorization', auth(adminLogin.accessToken))

    expect(allowedResponse.status).toBe(200)
    expect(allowedResponse.body).toMatchObject({
      items: expect.any(Array),
      page: 1,
      pageSize: 30,
      total: expect.any(Number),
    })
  })

  it('runs the documents lifecycle against MySQL including events, search, sorting, soft delete, hard remove, and audit logs', async () => {
    const { accessToken } = await login()
    const createdResponse = await request(context.app)
      .post('/api/v1/documents')
      .set('Authorization', auth(accessToken))
      .send(validDocumentPayload('INT-002/2026'))

    expect(createdResponse.status).toBe(201)
    expect(createdResponse.body.officeNumber).toBe('INT-002/2026')

    const listResponse = await request(context.app)
      .get('/api/v1/documents?q=INT&sortBy=receivedDate&sortOrder=asc&page=1&pageSize=10')
      .set('Authorization', auth(accessToken))

    expect(listResponse.status).toBe(200)
    expect(listResponse.body.items.length).toBeGreaterThanOrEqual(2)
    const listedDocument = listResponse.body.items.find(
      (item: { officeNumber: string }) => item.officeNumber === 'INT-002/2026',
    )

    expect(listedDocument).toBeDefined()
    expect(String(listedDocument.receivedDate)).toMatch(/^2026-06-02/)

    const updateResponse = await request(context.app)
      .patch(`/api/v1/documents/${createdResponse.body.id}`)
      .set('Authorization', auth(accessToken))
      .send({
        currentStatusId: ids.statusClosed,
        observations: 'Cerrado por prueba de integración',
      })

    expect(updateResponse.status).toBe(200)
    expect(updateResponse.body.currentStatus.id).toBe(ids.statusClosed)

    const eventResponse = await request(context.app)
      .post(`/api/v1/documents/${createdResponse.body.id}/events`)
      .set('Authorization', auth(accessToken))
      .send({ eventType: 'NOTE_ADDED', note: 'Nota real en MySQL' })

    expect(eventResponse.status).toBe(201)
    expect(eventResponse.body.eventType).toBe('NOTE_ADDED')

    const eventsResponse = await request(context.app)
      .get(`/api/v1/documents/${createdResponse.body.id}/events`)
      .set('Authorization', auth(accessToken))

    expect(eventsResponse.status).toBe(200)
    expect(eventsResponse.body.items.map((event: { eventType: string }) => event.eventType)).toEqual(
      expect.arrayContaining(['CREATED', 'STATUS_CHANGED', 'NOTE_ADDED']),
    )

    const softDeleteResponse = await request(context.app)
      .patch(`/api/v1/documents/delete/${createdResponse.body.id}`)
      .set('Authorization', auth(accessToken))

    expect(softDeleteResponse.status).toBe(204)

    const deletedDetailResponse = await request(context.app)
      .get(`/api/v1/documents/${createdResponse.body.id}`)
      .set('Authorization', auth(accessToken))

    expect(deletedDetailResponse.status).toBe(404)

    const hardRemoveResponse = await request(context.app)
      .delete(`/api/v1/documents/remove/${ids.removableDocument}`)
      .set('Authorization', auth(accessToken))

    expect(hardRemoveResponse.status).toBe(204)

    const removedRows = await context.db
      .select()
      .from(context.schema.documents)
      .where(eq(context.schema.documents.id, ids.removableDocument))

    expect(removedRows).toHaveLength(0)

    const auditResponse = await request(context.app)
      .get('/api/v1/audit-logs?action=documents.create')
      .set('Authorization', auth(accessToken))

    expect(auditResponse.status).toBe(200)
    expect(auditResponse.body.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          action: 'documents.create',
          entityType: 'document',
          entityId: createdResponse.body.id,
        }),
      ]),
    )
  })

  it('persists catalog changes and exposes duplicate constraints as real database failures', async () => {
    const { accessToken } = await login()
    const createdTypeResponse = await request(context.app)
      .post('/api/v1/document-types')
      .set('Authorization', auth(accessToken))
      .send({ code: 'MEMO', name: 'Memorándum' })

    expect(createdTypeResponse.status).toBe(201)
    expect(createdTypeResponse.body).toMatchObject({
      code: 'MEMO',
      name: 'Memorándum',
    })

    const deactivatedResponse = await request(context.app)
      .patch(`/api/v1/document-types/${createdTypeResponse.body.id}/deactivate`)
      .set('Authorization', auth(accessToken))

    expect(deactivatedResponse.status).toBe(200)
    expect(deactivatedResponse.body.isActive).toBe(false)

    const activeOnlyResponse = await request(context.app)
      .get('/api/v1/document-types')
      .set('Authorization', auth(accessToken))

    expect(
      activeOnlyResponse.body.items.some(
        (item: { id: string }) => item.id === createdTypeResponse.body.id,
      ),
    ).toBe(false)

    const includeInactiveResponse = await request(context.app)
      .get('/api/v1/document-types?includeInactive=true')
      .set('Authorization', auth(accessToken))

    expect(
      includeInactiveResponse.body.items.some(
        (item: { id: string }) => item.id === createdTypeResponse.body.id,
      ),
    ).toBe(true)

    const duplicateResponse = await request(context.app)
      .post('/api/v1/document-types')
      .set('Authorization', auth(accessToken))
      .send({ code: 'OFICIO', name: 'Código duplicado' })

    expect(duplicateResponse.status).toBe(409)
    expect(duplicateResponse.body.error.code).toBe(
      'DOCUMENT_TYPE_ALREADY_EXISTS',
    )
  })

  it('enforces foreign keys and rolls back failed document creation', async () => {
    const { accessToken } = await login()
    const response = await request(context.app)
      .post('/api/v1/documents')
      .set('Authorization', auth(accessToken))
      .send({
        ...validDocumentPayload('INT-FK/2026'),
        documentTypeId: '00000000-0000-4000-8000-999999999999',
      })

    expect(response.status).toBe(400)
    expect(response.body.error.code).toBe('INVALID_DOCUMENT_REFERENCE')

    const documentRows = await context.db
      .select()
      .from(context.schema.documents)
      .where(eq(context.schema.documents.officeNumber, 'INT-FK/2026'))
    const eventRows = await context.db
      .select()
      .from(context.schema.documentEvents)
      .where(eq(context.schema.documentEvents.documentId, 'INT-FK/2026'))

    expect(documentRows).toHaveLength(0)
    expect(eventRows).toHaveLength(0)
  })

  it('rolls back explicit Drizzle transactions on error', async () => {
    await expect(
      context.db.transaction(async (tx) => {
        await tx.insert(context.schema.documentTypes).values({
          id: ids.transactionType,
          code: 'TX',
          name: 'Tipo transaccional',
        })

        throw new Error('force rollback')
      }),
    ).rejects.toThrow('force rollback')

    const rows = await context.db
      .select()
      .from(context.schema.documentTypes)
      .where(eq(context.schema.documentTypes.id, ids.transactionType))

    expect(rows).toHaveLength(0)
  })

  it('keeps duplicate office numbers unique at the database level', async () => {
    const { schema, db } = context

    await expect(
      db.insert(schema.documents).values({
        id: '00000000-0000-4000-8000-000000000012',
        officeNumber: 'INT-001/2026',
        documentTypeId: ids.documentType,
        receivedDate: new Date('2026-06-04'),
        currentStatusId: ids.statusReceived,
        createdBy: ids.adminUser,
        updatedBy: ids.adminUser,
      }),
    ).rejects.toThrow()

    const [countResult] = await db
      .select({ total: sql<number>`count(*)` })
      .from(schema.documents)
      .where(
        and(
          eq(schema.documents.officeNumber, 'INT-001/2026'),
          isNull(schema.documents.deletedAt),
        ),
      )

    expect(Number(countResult?.total ?? 0)).toBe(1)
  })
})
