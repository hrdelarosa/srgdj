import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  selectResults: [] as unknown[][],
  valuesArgs: [] as unknown[],
  whereArgs: [] as unknown[],
  limitArgs: [] as number[],
  offsetArgs: [] as number[],
  orderByArgs: [] as unknown[],
}))

function createSelectBuilder(result: unknown[]) {
  const builder = {
    from: vi.fn(() => builder),
    leftJoin: vi.fn(() => builder),
    where: vi.fn((condition) => {
      mocks.whereArgs.push(condition)
      return builder
    }),
    orderBy: vi.fn((orderBy) => {
      mocks.orderByArgs.push(orderBy)
      return builder
    }),
    limit: vi.fn((limit) => {
      mocks.limitArgs.push(limit)
      return builder
    }),
    offset: vi.fn((offset) => {
      mocks.offsetArgs.push(offset)
      return Promise.resolve(result)
    }),
    then: (
      resolve: (value: unknown[]) => unknown,
      reject?: (reason: unknown) => unknown,
    ) => Promise.resolve(result).then(resolve, reject),
  }

  return builder
}

vi.mock('drizzle-orm', async (importOriginal) => {
  const actual = await importOriginal<typeof import('drizzle-orm')>()

  return {
    ...actual,
    and: (...conditions: unknown[]) => ({ op: 'and', conditions }),
    count: () => ({ op: 'count' }),
    desc: (column: unknown) => ({ direction: 'desc', column }),
    eq: (left: unknown, right: unknown) => ({ op: 'eq', left, right }),
    gte: (left: unknown, right: unknown) => ({ op: 'gte', left, right }),
    lte: (left: unknown, right: unknown) => ({ op: 'lte', left, right }),
    sql: () => ({ op: 'sql' }),
  }
})

vi.mock('../../database/db.js', () => ({
  db: {
    select: vi.fn(() => createSelectBuilder(mocks.selectResults.shift() ?? [])),
    insert: vi.fn(() => ({
      values: vi.fn((data) => {
        mocks.valuesArgs.push(data)
        return Promise.resolve()
      }),
    })),
  },
}))

const { AuditModel } = await import('./audit.model.js')

const auditLog = {
  id: '019e9bc2-a9d6-74c9-adad-9cad76f1d9f1',
  action: 'documents.create',
}

beforeEach(() => {
  mocks.selectResults = []
  mocks.valuesArgs = []
  mocks.whereArgs = []
  mocks.limitArgs = []
  mocks.offsetArgs = []
  mocks.orderByArgs = []
})

describe('AuditModel', () => {
  it('creates audit logs with defaults for optional fields', async () => {
    await AuditModel.create({
      data: {
        action: 'auth.login_success',
        entityType: 'auth',
      },
    })

    expect(mocks.valuesArgs[0]).toMatchObject({
      actorUserId: null,
      action: 'auth.login_success',
      entityType: 'auth',
      entityId: null,
      metadata: {},
      ip: null,
      userAgent: null,
    })
  })

  it('lists audit logs with pagination defaults', async () => {
    mocks.selectResults = [[auditLog], [{ total: 1 }]]

    const result = await AuditModel.findAll({ page: 1, pageSize: 30 })

    expect(result).toEqual({
      items: [auditLog],
      page: 1,
      pageSize: 30,
      total: 1,
      totalPages: 1,
    })
    expect(mocks.limitArgs).toEqual([30])
    expect(mocks.offsetArgs).toEqual([0])
  })

  it('applies pagination and filters', async () => {
    const actorUserId = '019e9bc2-a9d6-74c9-adad-9cad76f1d9e1'
    mocks.selectResults = [[auditLog], [{ total: 40 }]]

    const result = await AuditModel.findAll({
      action: 'documents.create',
      entityType: 'document',
      actorUserId,
      dateFrom: new Date('2026-06-01'),
      dateTo: new Date('2026-06-30'),
      page: 2,
      pageSize: 10,
    })

    expect(result.totalPages).toBe(4)
    expect(mocks.limitArgs).toEqual([10])
    expect(mocks.offsetArgs).toEqual([10])
    expect(mocks.whereArgs[0]).toMatchObject({
      op: 'and',
      conditions: expect.arrayContaining([
        expect.objectContaining({ op: 'eq' }),
        expect.objectContaining({ op: 'gte' }),
        expect.objectContaining({ op: 'lte' }),
      ]),
    })
  })

  it('returns empty pagination when no total row exists', async () => {
    mocks.selectResults = [[], []]

    const result = await AuditModel.findAll({ page: 1, pageSize: 10 })

    expect(result).toEqual({
      items: [],
      page: 1,
      pageSize: 10,
      total: 0,
      totalPages: 0,
    })
  })
})
