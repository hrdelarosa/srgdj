import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  selectResults: [] as unknown[][],
  txSelectResults: [] as unknown[][],
  whereArgs: [] as Array<{ op: string; conditions?: Array<{ op: string }> }>,
  orderByArgs: [] as Array<{ direction: string; column: unknown }>,
  limitArgs: [] as number[],
  offsetArgs: [] as number[],
  insertValuesArgs: [] as unknown[],
  updateSetArgs: [] as unknown[],
  deleteWhereArgs: [] as unknown[],
  transaction: vi.fn(),
}))

function createSelectBuilder(result: unknown[]) {
  const builder = {
    from: vi.fn(() => builder),
    innerJoin: vi.fn(() => builder),
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

function createUpdateBuilder() {
  const builder = {
    set: vi.fn((data) => {
      mocks.updateSetArgs.push(data)
      return builder
    }),
    where: vi.fn((condition) => {
      mocks.whereArgs.push(condition)
      return Promise.resolve()
    }),
  }

  return builder
}

function createDeleteBuilder() {
  return {
    where: vi.fn((condition) => {
      mocks.deleteWhereArgs.push(condition)
      return Promise.resolve()
    }),
  }
}

const tx = {
  insert: vi.fn(() => ({
    values: vi.fn((data) => {
      mocks.insertValuesArgs.push(data)
      return Promise.resolve()
    }),
  })),
  update: vi.fn(() => createUpdateBuilder()),
  select: vi.fn(() => createSelectBuilder(mocks.txSelectResults.shift() ?? [])),
}

vi.mock('uuid', () => ({
  v7: () => '019e9bc2-aa31-7579-8b80-e9ed2450ecb3',
}))

vi.mock('drizzle-orm', async (importOriginal) => {
  const actual = await importOriginal<typeof import('drizzle-orm')>()

  return {
    ...actual,
    and: (...conditions: Array<{ op: string }>) => ({
      op: 'and',
      conditions,
    }),
    asc: (column: unknown) => ({ direction: 'asc', column }),
    count: () => ({ op: 'count' }),
    desc: (column: unknown) => ({ direction: 'desc', column }),
    eq: (left: unknown, right: unknown) => ({ op: 'eq', left, right }),
    gte: (left: unknown, right: unknown) => ({ op: 'gte', left, right }),
    isNull: (column: unknown) => ({ op: 'isNull', column }),
    like: (left: unknown, right: unknown) => ({ op: 'like', left, right }),
    lte: (left: unknown, right: unknown) => ({ op: 'lte', left, right }),
    or: (...conditions: Array<{ op: string }>) => ({ op: 'or', conditions }),
    sql: () => ({ op: 'sql' }),
  }
})

vi.mock('../../database/db.js', () => ({
  db: {
    select: vi.fn(() => createSelectBuilder(mocks.selectResults.shift() ?? [])),
    insert: vi.fn(() => ({
      values: vi.fn((data) => {
        mocks.insertValuesArgs.push(data)
        return Promise.resolve()
      }),
    })),
    update: vi.fn(() => createUpdateBuilder()),
    delete: vi.fn(() => createDeleteBuilder()),
    transaction: mocks.transaction,
  },
}))

const { DocumentModel } = await import('./document.model.js')

const documentId = '019e9bc2-aa31-7579-8b80-e9ed2450ecb3'
const userId = '019e9bc2-a9d6-74c9-adad-9cad76f1d9e1'
const statusId = '019e9bc2-a9d0-72f2-a385-2c5d1dd3310f'
const nextStatusId = '019e9bc2-a9d0-72f2-a385-2c5d1dd3311f'

const documentRow = {
  id: documentId,
  officeNumber: 'INM-AJ-001/2026',
  currentStatusId: statusId,
}

const eventRow = {
  id: '019e9bc2-aa31-7579-8b80-e9ed2450ecb4',
  documentId,
  eventType: 'NOTE_ADDED',
}

beforeEach(() => {
  mocks.selectResults = []
  mocks.txSelectResults = []
  mocks.whereArgs = []
  mocks.orderByArgs = []
  mocks.limitArgs = []
  mocks.offsetArgs = []
  mocks.insertValuesArgs = []
  mocks.updateSetArgs = []
  mocks.deleteWhereArgs = []
  mocks.transaction.mockReset()
  mocks.transaction.mockImplementation((callback) => callback(tx))
  tx.insert.mockClear()
  tx.update.mockClear()
  tx.select.mockClear()
})

describe('DocumentModel.findAll', () => {
  it('aplica filtros, búsqueda, ordenamiento y paginación', async () => {
    mocks.selectResults = [[documentRow], [{ total: 42 }]]

    const result = await DocumentModel.findAll({
      page: 2,
      pageSize: 10,
      q: 'INM',
      documentTypeId: '019e9bc2-a9cd-74e0-bcc6-89bd3dd7c001',
      currentStatusId: statusId,
      receivedDateFrom: new Date('2026-06-01'),
      receivedDateTo: new Date('2026-06-30'),
      sortBy: 'status',
      sortOrder: 'asc',
    })

    expect(result).toEqual({
      items: [documentRow],
      page: 2,
      pageSize: 10,
      total: 42,
      totalPages: 5,
    })
    expect(mocks.limitArgs).toEqual([10])
    expect(mocks.offsetArgs).toEqual([10])
    expect(mocks.orderByArgs[0]).toMatchObject({ direction: 'asc' })
    expect(mocks.whereArgs[0]).toMatchObject({
      op: 'and',
      conditions: expect.arrayContaining([
        expect.objectContaining({ op: 'isNull' }),
        expect.objectContaining({ op: 'or' }),
        expect.objectContaining({ op: 'eq' }),
        expect.objectContaining({ op: 'gte' }),
        expect.objectContaining({ op: 'lte' }),
      ]),
    })
  })

  it('usa defaults y total cero cuando no hay conteo', async () => {
    mocks.selectResults = [[], []]

    const result = await DocumentModel.findAll({
      page: 1,
      pageSize: 30,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    })

    expect(result).toEqual({
      items: [],
      page: 1,
      pageSize: 30,
      total: 0,
      totalPages: 0,
    })
    expect(mocks.orderByArgs[0]).toMatchObject({ direction: 'desc' })
  })
})

describe('DocumentModel finders', () => {
  it('findById devuelve documento con eventos', async () => {
    mocks.selectResults = [[documentRow], [eventRow]]

    const result = await DocumentModel.findById({ id: documentId })

    expect(result).toEqual({
      ...documentRow,
      events: [eventRow],
    })
  })

  it('findById devuelve null cuando no existe o está eliminado', async () => {
    mocks.selectResults = [[]]

    const result = await DocumentModel.findById({ id: documentId })

    expect(result).toBeNull()
    expect(mocks.whereArgs[0]).toMatchObject({
      op: 'and',
      conditions: expect.arrayContaining([
        expect.objectContaining({ op: 'eq' }),
        expect.objectContaining({ op: 'isNull' }),
      ]),
    })
  })

  it('findByOfficeNumber devuelve documento o null', async () => {
    mocks.selectResults = [[documentRow]]
    await expect(
      DocumentModel.findByOfficeNumber({ officeNumber: 'INM-AJ-001/2026' }),
    ).resolves.toBe(documentRow)

    mocks.selectResults = [[]]
    await expect(
      DocumentModel.findByOfficeNumber({ officeNumber: 'missing' }),
    ).resolves.toBeNull()
  })
})

describe('DocumentModel.create', () => {
  it('crea documento y evento inicial dentro de una transacción', async () => {
    mocks.selectResults = [[documentRow], []]

    const result = await DocumentModel.create({
      document: {
        officeNumber: 'INM-AJ-001/2026',
        caseNumber: 'EXP-001/2026',
        actor: 'Actor',
        defendant: 'Demandado',
        documentTypeId: '019e9bc2-a9cd-74e0-bcc6-89bd3dd7c001',
        officeDate: '2026-06-01',
        receivedDate: '2026-06-02',
        annexes: 'Anexo',
        physicalLocationId: '',
        currentStatusId: statusId,
        observations: 'Observación',
        userId,
      },
    })

    expect(result).toEqual({ ...documentRow, events: [] })
    expect(mocks.transaction).toHaveBeenCalledOnce()
    expect(mocks.insertValuesArgs[0]).toMatchObject({
      id: documentId,
      officeNumber: 'INM-AJ-001/2026',
      currentStatusId: statusId,
      createdBy: userId,
      updatedBy: userId,
    })
    expect(mocks.insertValuesArgs[1]).toMatchObject({
      documentId,
      eventType: 'CREATED',
      toStatusId: statusId,
      createdBy: userId,
    })
  })
})

describe('DocumentModel.update', () => {
  it('devuelve null y no abre transacción si el documento no existe', async () => {
    mocks.selectResults = [[]]

    const result = await DocumentModel.update({
      id: documentId,
      document: {
        id: documentId,
        userId,
        observations: 'Actualización',
      },
    })

    expect(result).toBeNull()
    expect(mocks.transaction).not.toHaveBeenCalled()
    expect(mocks.whereArgs[0]).toMatchObject({
      op: 'and',
      conditions: expect.arrayContaining([
        expect.objectContaining({ op: 'eq' }),
        expect.objectContaining({ op: 'isNull' }),
      ]),
    })
  })

  it('actualiza campos y registra evento UPDATED', async () => {
    mocks.selectResults = [[documentRow], [documentRow], []]

    const result = await DocumentModel.update({
      id: documentId,
      document: {
        id: documentId,
        userId,
        officeNumber: 'INM-AJ-002/2026',
        caseNumber: null as unknown as string,
        actor: 'Nuevo actor',
        defendant: 'Nuevo demandado',
        officeDate: '2026-06-03',
        receivedDate: '2026-06-04',
        annexes: null as unknown as string,
        physicalLocationId: null as unknown as string,
        observations: 'Actualizado',
      },
    })

    expect(result).toEqual({ ...documentRow, events: [] })
    expect(mocks.transaction).toHaveBeenCalledOnce()
    expect(mocks.updateSetArgs[0]).toMatchObject({
      officeNumber: 'INM-AJ-002/2026',
      caseNumber: null,
      actor: 'Nuevo actor',
      defendant: 'Nuevo demandado',
      annexes: null,
      physicalLocationId: null,
      observations: 'Actualizado',
      updatedBy: userId,
      updatedAt: expect.any(Date),
    })
    expect(mocks.insertValuesArgs[0]).toMatchObject({
      documentId,
      eventType: 'UPDATED',
      createdBy: userId,
    })
  })

  it('registra STATUS_CHANGED cuando cambia el estatus', async () => {
    mocks.selectResults = [[documentRow], [documentRow], []]

    await DocumentModel.update({
      id: documentId,
      document: {
        id: documentId,
        userId,
        currentStatusId: nextStatusId,
      },
    })

    expect(mocks.insertValuesArgs[0]).toMatchObject({
      documentId,
      eventType: 'STATUS_CHANGED',
      fromStatusId: statusId,
      toStatusId: nextStatusId,
      createdBy: userId,
    })
  })
})

describe('DocumentModel delete/remove', () => {
  it('delete devuelve null si el documento no existe', async () => {
    mocks.selectResults = [[]]

    const result = await DocumentModel.delete({ id: documentId, userId })

    expect(result).toBeNull()
    expect(mocks.transaction).not.toHaveBeenCalled()
  })

  it('delete marca deletedAt y registra evento DELETED', async () => {
    mocks.selectResults = [[documentRow], []]

    const result = await DocumentModel.delete({ id: documentId, userId })

    expect(result).toBe(true)
    expect(mocks.updateSetArgs[0]).toMatchObject({
      deletedAt: expect.any(Date),
      updatedBy: userId,
    })
    expect(mocks.insertValuesArgs[0]).toMatchObject({
      documentId,
      eventType: 'DELETED',
      createdBy: userId,
    })
  })

  it('remove devuelve null si no existe y elimina físicamente si existe', async () => {
    mocks.selectResults = [[]]
    await expect(DocumentModel.remove({ id: documentId })).resolves.toBeNull()

    mocks.selectResults = [[documentRow], []]
    await expect(DocumentModel.remove({ id: documentId })).resolves.toBe(true)

    expect(mocks.deleteWhereArgs[0]).toMatchObject({ op: 'eq' })
  })
})

describe('DocumentModel events', () => {
  it('lista eventos del documento ordenados por fecha descendente', async () => {
    mocks.selectResults = [[eventRow]]

    await expect(
      DocumentModel.findEventsByDocumentId({ id: documentId }),
    ).resolves.toEqual([eventRow])

    expect(mocks.whereArgs[0]).toMatchObject({ op: 'eq' })
    expect(mocks.orderByArgs[0]).toMatchObject({ direction: 'desc' })
  })

  it('createEvent devuelve null si el documento no existe', async () => {
    mocks.selectResults = [[]]

    const result = await DocumentModel.createEvent({
      id: documentId,
      userId,
      data: { eventType: 'NOTE_ADDED', note: 'Nota' },
    })

    expect(result).toBeNull()
    expect(mocks.transaction).not.toHaveBeenCalled()
  })

  it('createEvent registra eventos simples dentro de una transacción', async () => {
    mocks.selectResults = [[documentRow]]
    mocks.txSelectResults = [[eventRow]]

    const result = await DocumentModel.createEvent({
      id: documentId,
      userId,
      data: {
        eventType: 'NOTE_ADDED',
        note: 'Nota',
        metadata: { source: 'test' },
      },
    })

    expect(result).toBe(eventRow)
    expect(mocks.transaction).toHaveBeenCalledOnce()
    expect(mocks.insertValuesArgs[0]).toMatchObject({
      id: documentId,
      documentId,
      eventType: 'NOTE_ADDED',
      fromStatusId: null,
      toStatusId: null,
      note: 'Nota',
      metadata: { source: 'test' },
      createdBy: userId,
    })
  })

  it('createEvent requiere toStatusId para STATUS_CHANGED', async () => {
    mocks.selectResults = [[documentRow]]

    await expect(
      DocumentModel.createEvent({
        id: documentId,
        userId,
        data: { eventType: 'STATUS_CHANGED' },
      }),
    ).rejects.toMatchObject({
      code: 'STATUS_REQUIRED',
      statusCode: 400,
    })
  })

  it('createEvent actualiza estatus y registra evento STATUS_CHANGED', async () => {
    mocks.selectResults = [[documentRow]]
    mocks.txSelectResults = [[eventRow]]

    const result = await DocumentModel.createEvent({
      id: documentId,
      userId,
      data: {
        eventType: 'STATUS_CHANGED',
        toStatusId: nextStatusId,
        note: 'Cambio de estado',
      },
    })

    expect(result).toBe(eventRow)
    expect(mocks.updateSetArgs[0]).toMatchObject({
      currentStatusId: nextStatusId,
      updatedBy: userId,
      updatedAt: expect.any(Date),
    })
    expect(mocks.insertValuesArgs[0]).toMatchObject({
      eventType: 'STATUS_CHANGED',
      fromStatusId: statusId,
      toStatusId: nextStatusId,
      createdBy: userId,
    })
  })
})
