import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  nextSelectResult: [] as unknown[],
  valuesArgs: [] as unknown[],
  setArgs: [] as unknown[],
  whereArgs: [] as unknown[],
}))

function createSelectBuilder() {
  const builder = {
    from: vi.fn(() => builder),
    where: vi.fn((condition) => {
      mocks.whereArgs.push(condition)
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
  v7: () => '019e9bc2-a9d6-74c9-adad-9cad76f1d9a1',
}))

vi.mock('drizzle-orm', async (importOriginal) => {
  const actual = await importOriginal<typeof import('drizzle-orm')>()

  return {
    ...actual,
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

const { PermissionModel } = await import('./permission.model.js')

const permission = {
  id: '019e9bc2-a9d6-74c9-adad-9cad76f1d9a1',
  code: 'documents:read',
}

beforeEach(() => {
  mocks.nextSelectResult = []
  mocks.valuesArgs = []
  mocks.setArgs = []
  mocks.whereArgs = []
})

describe('PermissionModel', () => {
  it('lists and finds permissions or returns null', async () => {
    mocks.nextSelectResult = [permission]

    await expect(PermissionModel.findAll()).resolves.toEqual([permission])
    await expect(PermissionModel.findById({ id: permission.id })).resolves.toBe(
      permission,
    )

    mocks.nextSelectResult = []

    await expect(
      PermissionModel.findById({ id: permission.id }),
    ).resolves.toBeNull()
  })

  it('creates permissions and returns the inserted record lookup', async () => {
    mocks.nextSelectResult = [permission]

    await expect(
      PermissionModel.create({
        data: { code: 'documents:read', name: 'Leer documentos' },
      }),
    ).resolves.toBe(permission)

    expect(mocks.valuesArgs[0]).toMatchObject({
      id: permission.id,
      code: 'documents:read',
      isSystem: false,
      isActive: true,
    })
  })

  it('updates and activates permissions', async () => {
    mocks.nextSelectResult = [permission]

    await PermissionModel.update({
      id: permission.id,
      data: { name: 'Leer documentos actualizado' },
    })
    await PermissionModel.setActive({ id: permission.id, isActive: false })

    expect(mocks.setArgs[0]).toMatchObject({
      name: 'Leer documentos actualizado',
      updatedAt: expect.any(Date),
    })
    expect(mocks.setArgs[1]).toMatchObject({
      isActive: false,
      updatedAt: expect.any(Date),
    })
  })
})
