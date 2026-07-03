import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  orderByArgs: [] as Array<{ direction: string; column: unknown }>,
  selectWhereArgs: [] as Array<{
    op: string
    conditions: Array<{ op: string }>
  }>,
  updateWhereArgs: [] as Array<{
    op: string
    conditions: Array<{ op: string }>
  }>,
  nextSelectResult: [] as unknown[],
  nextItemsResult: [] as unknown[],
  transaction: vi.fn(),
}))

function createSelectBuilder() {
  const builder = {
    from: vi.fn(() => builder),
    innerJoin: vi.fn(() => builder),
    leftJoin: vi.fn(() => builder),
    where: vi.fn((condition) => {
      mocks.selectWhereArgs.push(condition)
      return builder
    }),
    orderBy: vi.fn((orderBy) => {
      mocks.orderByArgs.push(orderBy)
      return builder
    }),
    limit: vi.fn(() => builder),
    offset: vi.fn(() => Promise.resolve(mocks.nextItemsResult)),
    then: (
      resolve: (value: unknown[]) => unknown,
      reject?: (reason: unknown) => unknown,
    ) => Promise.resolve(mocks.nextSelectResult).then(resolve, reject),
  }

  return builder
}

function createUpdateBuilder() {
  const builder = {
    set: vi.fn(() => builder),
    where: vi.fn((condition) => {
      mocks.updateWhereArgs.push(condition)
      return Promise.resolve()
    }),
  }

  return builder
}

vi.mock('drizzle-orm', async (importOriginal) => {
  const actual = await importOriginal<typeof import('drizzle-orm')>()

  return {
    ...actual,
    and: (...conditions: Array<{ op: string }>) => ({
      op: 'and',
      conditions,
    }),
    asc: (column: unknown) => ({ direction: 'asc', column }),
    desc: (column: unknown) => ({ direction: 'desc', column }),
    eq: (left: unknown, right: unknown) => ({ op: 'eq', left, right }),
    isNull: (column: unknown) => ({ op: 'isNull', column }),
  }
})

vi.mock('../../database/db.js', () => ({
  db: {
    select: vi.fn(() => createSelectBuilder()),
    update: vi.fn(() => createUpdateBuilder()),
    insert: vi.fn(() => ({
      values: vi.fn(() => Promise.resolve()),
    })),
    transaction: mocks.transaction,
  },
}))

const { DocumentModel } = await import('./document.model.js')

describe('DocumentModel.findAll', () => {
  beforeEach(() => {
    mocks.orderByArgs = []
    mocks.selectWhereArgs = []
    mocks.nextItemsResult = []
    mocks.nextSelectResult = [{ total: 0 }]
  })

  it('aplica sortBy y sortOrder en la consulta', async () => {
    await DocumentModel.findAll({
      page: 1,
      pageSize: 30,
      sortBy: 'officeDate',
      sortOrder: 'asc',
    })

    expect(mocks.orderByArgs[0]).toMatchObject({
      direction: 'asc',
    })
  })
})

describe('DocumentModel.update', () => {
  beforeEach(() => {
    mocks.selectWhereArgs = []
    mocks.updateWhereArgs = []
    mocks.nextSelectResult = []
    mocks.transaction.mockReset()
  })

  it('busca solo documentos no eliminados antes de actualizar', async () => {
    const result = await DocumentModel.update({
      id: '019e9bc2-aa31-7579-8b80-e9ed2450ecb3',
      document: {
        id: '019e9bc2-aa31-7579-8b80-e9ed2450ecb3',
        userId: '019e9bc2-a9d6-74c9-adad-9cad76f1d9e1',
        observations: 'Actualización',
      },
    })

    expect(result).toBeNull()
    expect(mocks.transaction).not.toHaveBeenCalled()
    expect(mocks.selectWhereArgs[0]).toMatchObject({
      op: 'and',
      conditions: expect.arrayContaining([
        expect.objectContaining({ op: 'eq' }),
        expect.objectContaining({ op: 'isNull' }),
      ]),
    })
  })
})
