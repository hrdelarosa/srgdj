import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  nextSelectResult: [] as unknown[],
  transactionSelectResult: [] as Array<{ id: string }>,
  valuesArgs: [] as unknown[],
  setArgs: [] as unknown[],
  whereArgs: [] as unknown[],
  deleteWhereArgs: [] as unknown[],
  insertValuesArgs: [] as unknown[],
}))

function createSelectBuilder(result = () => mocks.nextSelectResult) {
  const builder = {
    from: vi.fn(() => builder),
    innerJoin: vi.fn(() => builder),
    where: vi.fn((condition) => {
      mocks.whereArgs.push(condition)
      return builder
    }),
    limit: vi.fn(() => Promise.resolve(result())),
    then: (
      resolve: (value: unknown[]) => unknown,
      reject?: (reason: unknown) => unknown,
    ) => Promise.resolve(result()).then(resolve, reject),
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
  v7: () => '019e9bc2-a9d6-74c9-adad-9cad76f1d9e2',
}))

vi.mock('drizzle-orm', async (importOriginal) => {
  const actual = await importOriginal<typeof import('drizzle-orm')>()

  return {
    ...actual,
    and: (...conditions: unknown[]) => ({ op: 'and', conditions }),
    eq: (left: unknown, right: unknown) => ({ op: 'eq', left, right }),
    inArray: (left: unknown, right: unknown) => ({ op: 'inArray', left, right }),
  }
})

const tx = {
  delete: vi.fn(() => ({
    where: vi.fn((condition) => {
      mocks.deleteWhereArgs.push(condition)
      return Promise.resolve()
    }),
  })),
  select: vi.fn(() => createSelectBuilder(() => mocks.transactionSelectResult)),
  insert: vi.fn(() => ({
    values: vi.fn((data) => {
      mocks.insertValuesArgs.push(data)
      return Promise.resolve()
    }),
  })),
}

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
    transaction: vi.fn((callback) => callback(tx)),
  },
}))

const { RoleModel } = await import('./role.model.js')

const role = {
  id: '019e9bc2-a9d6-74c9-adad-9cad76f1d9e2',
  code: 'ADMIN',
}

const permission = {
  id: '019e9bc2-a9d6-74c9-adad-9cad76f1d9a1',
  code: 'documents:read',
}

beforeEach(() => {
  mocks.nextSelectResult = []
  mocks.transactionSelectResult = []
  mocks.valuesArgs = []
  mocks.setArgs = []
  mocks.whereArgs = []
  mocks.deleteWhereArgs = []
  mocks.insertValuesArgs = []
})

describe('RoleModel', () => {
  it('lists and finds roles or returns null', async () => {
    mocks.nextSelectResult = [role]

    await expect(RoleModel.findAll()).resolves.toEqual([role])
    await expect(RoleModel.findById({ id: role.id })).resolves.toBe(role)

    mocks.nextSelectResult = []

    await expect(RoleModel.findById({ id: role.id })).resolves.toBeNull()
  })

  it('creates, updates, and activates roles', async () => {
    mocks.nextSelectResult = [role]

    await RoleModel.create({
      data: { code: 'ADMIN', name: 'Administrador', description: null },
    })
    await RoleModel.update({ id: role.id, data: { name: 'Admin' } })
    await RoleModel.setActive({ id: role.id, isActive: false })

    expect(mocks.valuesArgs[0]).toMatchObject({
      id: role.id,
      code: 'ADMIN',
      isActive: true,
    })
    expect(mocks.setArgs[0]).toMatchObject({
      name: 'Admin',
      updatedAt: expect.any(Date),
    })
    expect(mocks.setArgs[1]).toMatchObject({
      isActive: false,
      updatedAt: expect.any(Date),
    })
  })

  it('lists role permissions', async () => {
    mocks.nextSelectResult = [permission]

    await expect(
      RoleModel.findPermissionsByRoleId({ id: role.id }),
    ).resolves.toEqual([permission])
  })

  it('updates role permissions in a transaction', async () => {
    mocks.transactionSelectResult = [{ id: permission.id }]
    mocks.nextSelectResult = [permission]

    await expect(
      RoleModel.updatePermissions({
        id: role.id,
        data: { permissionIds: [permission.id] },
      }),
    ).resolves.toEqual([permission])

    expect(mocks.deleteWhereArgs).toHaveLength(1)
    expect(mocks.insertValuesArgs[0]).toEqual([
      { roleId: role.id, permissionId: permission.id },
    ])
  })

  it('rejects inactive or missing permission ids', async () => {
    mocks.transactionSelectResult = []

    await expect(
      RoleModel.updatePermissions({
        id: role.id,
        data: { permissionIds: [permission.id] },
      }),
    ).rejects.toMatchObject({
      code: 'INVALID_ROLE_PERMISSIONS',
      statusCode: 400,
    })
  })
})
