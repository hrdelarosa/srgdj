import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  nextSelectResult: [] as unknown[],
  valuesArgs: [] as unknown[],
  setArgs: [] as unknown[],
  whereArgs: [] as unknown[],
  orderByArgs: [] as unknown[],
}))

function createSelectBuilder() {
  const builder = {
    from: vi.fn(() => builder),
    where: vi.fn((condition) => {
      mocks.whereArgs.push(condition)
      return builder
    }),
    orderBy: vi.fn((orderBy) => {
      mocks.orderByArgs.push(orderBy)
      return builder
    }),
    limit: vi.fn(() => Promise.resolve(mocks.nextSelectResult)),
    then: (
      resolve: (value: unknown[]) => unknown,
      reject?: (reason: unknown) => unknown,
    ) => Promise.resolve(mocks.nextSelectResult).then(resolve, reject),
  }

  return builder
}

function createUpdateBuilder() {
  const builder = {
    set: vi.fn((data) => {
      mocks.setArgs.push(data)
      return builder
    }),
    where: vi.fn((condition) => {
      mocks.whereArgs.push(condition)
      return Promise.resolve()
    }),
  }

  return builder
}

vi.mock('uuid', () => ({
  v7: () => '019e9bc2-a9cd-74e0-bcc6-89bd3dd7c001',
}))

vi.mock('drizzle-orm', async (importOriginal) => {
  const actual = await importOriginal<typeof import('drizzle-orm')>()

  return {
    ...actual,
    asc: (column: unknown) => ({ direction: 'asc', column }),
    eq: (left: unknown, right: unknown) => ({ op: 'eq', left, right }),
  }
})

vi.mock('../../database/db.js', () => ({
  db: {
    select: vi.fn(() => createSelectBuilder()),
    insert: vi.fn(() => ({
      values: vi.fn((data) => {
        mocks.valuesArgs.push(data)
        return Promise.resolve()
      }),
    })),
    update: vi.fn(() => createUpdateBuilder()),
  },
}))

const { DocumentCatalogModel } = await import('./document-catalog.model.js')

const documentType = {
  id: '019e9bc2-a9cd-74e0-bcc6-89bd3dd7c001',
  code: 'OFICIO',
  name: 'Oficio',
}

const documentStatus = {
  id: '019e9bc2-a9d0-72f2-a385-2c5d1dd3310f',
  code: 'RECIBIDO',
  name: 'Recibido',
}

const physicalLocation = {
  id: '019e9bc2-a9d6-74c9-adad-9cad76f1d9a1',
  name: 'Archivo central',
}

beforeEach(() => {
  mocks.nextSelectResult = []
  mocks.valuesArgs = []
  mocks.setArgs = []
  mocks.whereArgs = []
  mocks.orderByArgs = []
})

describe('DocumentCatalogModel document types', () => {
  it('lists active and all document types', async () => {
    mocks.nextSelectResult = [documentType]

    await expect(DocumentCatalogModel.findDocumentTypes()).resolves.toEqual([
      documentType,
    ])
    await expect(DocumentCatalogModel.findAllDocumentTypes()).resolves.toEqual([
      documentType,
    ])
    expect(mocks.orderByArgs).toHaveLength(2)
  })

  it('finds, creates, updates, and activates document types', async () => {
    mocks.nextSelectResult = [documentType]

    await expect(
      DocumentCatalogModel.findDocumentTypeById({ id: documentType.id }),
    ).resolves.toBe(documentType)

    mocks.nextSelectResult = []
    await expect(
      DocumentCatalogModel.findDocumentTypeById({ id: documentType.id }),
    ).resolves.toBeNull()

    mocks.nextSelectResult = [documentType]
    await DocumentCatalogModel.createDocumentType({
      data: { code: 'OFICIO', name: 'Oficio' },
    })
    await DocumentCatalogModel.updateDocumentType({
      id: documentType.id,
      data: { name: 'Oficio actualizado' },
    })
    await DocumentCatalogModel.setDocumentTypeActive({
      id: documentType.id,
      isActive: false,
    })

    expect(mocks.valuesArgs[0]).toMatchObject({
      id: documentType.id,
      code: 'OFICIO',
      isActive: true,
    })
    expect(mocks.setArgs[0]).toEqual({ name: 'Oficio actualizado' })
    expect(mocks.setArgs[1]).toEqual({ isActive: false })
  })
})

describe('DocumentCatalogModel document statuses', () => {
  it('lists active and all document statuses', async () => {
    mocks.nextSelectResult = [documentStatus]

    await expect(DocumentCatalogModel.findDocumentStatuses()).resolves.toEqual([
      documentStatus,
    ])
    await expect(
      DocumentCatalogModel.findAllDocumentStatuses(),
    ).resolves.toEqual([documentStatus])
  })

  it('finds, creates, updates, and activates document statuses', async () => {
    mocks.nextSelectResult = [documentStatus]

    await expect(
      DocumentCatalogModel.findDocumentStatusById({ id: documentStatus.id }),
    ).resolves.toBe(documentStatus)

    mocks.nextSelectResult = []
    await expect(
      DocumentCatalogModel.findDocumentStatusById({ id: documentStatus.id }),
    ).resolves.toBeNull()

    mocks.nextSelectResult = [documentStatus]
    await DocumentCatalogModel.createDocumentStatus({
      data: { code: 'RECIBIDO', name: 'Recibido', sortOrder: 1 },
    })
    await DocumentCatalogModel.updateDocumentStatus({
      id: documentStatus.id,
      data: { name: 'Recibido actualizado' },
    })
    await DocumentCatalogModel.setDocumentStatusActive({
      id: documentStatus.id,
      isActive: false,
    })

    expect(mocks.valuesArgs[0]).toMatchObject({
      id: documentType.id,
      code: 'RECIBIDO',
      isTerminal: false,
      isActive: true,
    })
    expect(mocks.setArgs[0]).toEqual({ name: 'Recibido actualizado' })
    expect(mocks.setArgs[1]).toEqual({ isActive: false })
  })
})

describe('DocumentCatalogModel physical locations', () => {
  it('lists active and all physical locations', async () => {
    mocks.nextSelectResult = [physicalLocation]

    await expect(DocumentCatalogModel.findPhysicalLocations()).resolves.toEqual(
      [physicalLocation],
    )
    await expect(
      DocumentCatalogModel.findAllPhysicalLocations(),
    ).resolves.toEqual([physicalLocation])
  })

  it('finds, creates, updates, and activates physical locations', async () => {
    mocks.nextSelectResult = [physicalLocation]

    await expect(
      DocumentCatalogModel.findPhysicalLocationById({
        id: physicalLocation.id,
      }),
    ).resolves.toBe(physicalLocation)

    mocks.nextSelectResult = []
    await expect(
      DocumentCatalogModel.findPhysicalLocationById({
        id: physicalLocation.id,
      }),
    ).resolves.toBeNull()

    mocks.nextSelectResult = [physicalLocation]
    await DocumentCatalogModel.createPhysicalLocation({
      data: { name: 'Archivo central', drawer: 'A-01' },
    })
    await DocumentCatalogModel.updatePhysicalLocation({
      id: physicalLocation.id,
      data: { name: 'Archivo actualizado' },
    })
    await DocumentCatalogModel.setPhysicalLocationActive({
      id: physicalLocation.id,
      isActive: false,
    })

    expect(mocks.valuesArgs[0]).toMatchObject({
      id: documentType.id,
      name: 'Archivo central',
      drawer: 'A-01',
      isActive: true,
    })
    expect(mocks.setArgs[0]).toEqual({ name: 'Archivo actualizado' })
    expect(mocks.setArgs[1]).toEqual({ isActive: false })
  })
})
