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
    innerJoin: vi.fn(() => builder),
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
  v7: () => '019e9bc2-a9d6-74c9-adad-9cad76f1d9e3',
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
        return { $returningId: vi.fn(() => Promise.resolve()) }
      }),
    })),
    update: vi.fn(() => createUpdateBuilder()),
  },
}))

const { UserModel } = await import('./user.model.js')

const user = {
  id: '019e9bc2-a9d6-74c9-adad-9cad76f1d9e3',
  username: 'jlopez',
}

beforeEach(() => {
  mocks.nextSelectResult = []
  mocks.valuesArgs = []
  mocks.setArgs = []
  mocks.whereArgs = []
})

describe('UserModel', () => {
  it('lists users', async () => {
    mocks.nextSelectResult = [user]

    await expect(UserModel.findAll()).resolves.toEqual([user])
  })

  it('finds users, usernames, and roles or returns null', async () => {
    mocks.nextSelectResult = [user]
    await expect(UserModel.findById({ id: user.id })).resolves.toBe(user)

    mocks.nextSelectResult = []
    await expect(UserModel.findById({ id: user.id })).resolves.toBeNull()

    mocks.nextSelectResult = [{ id: user.id }]
    await expect(
      UserModel.findByUsername({ username: 'jlopez' }),
    ).resolves.toEqual({ id: user.id })

    mocks.nextSelectResult = []
    await expect(
      UserModel.findRoleById({
        roleId: '019e9bc2-a9d6-74c9-adad-9cad76f1d9e2',
      }),
    ).resolves.toBeNull()
  })

  it('creates users and returns the inserted record lookup', async () => {
    mocks.nextSelectResult = [user]

    await expect(
      UserModel.create({
        data: {
          username: 'jlopez',
          passwordHash: 'hash',
          fullName: 'Juan Lopez',
          roleId: '019e9bc2-a9d6-74c9-adad-9cad76f1d9e2',
          isActive: true,
          mustChangePassword: true,
          createdByUserId: '019e9bc2-a9d6-74c9-adad-9cad76f1d9e1',
        },
      }),
    ).resolves.toBe(user)

    expect(mocks.valuesArgs[0]).toMatchObject({
      id: user.id,
      username: 'jlopez',
    })
  })

  it('updates and activates users', async () => {
    mocks.nextSelectResult = [user]

    await UserModel.update({ id: user.id, data: { fullName: 'Juan' } })
    await UserModel.setActive({ id: user.id, isActive: false })

    expect(mocks.setArgs[0]).toMatchObject({
      fullName: 'Juan',
      updatedAt: expect.any(Date),
    })
    expect(mocks.setArgs[1]).toMatchObject({
      isActive: false,
      updatedAt: expect.any(Date),
    })
  })
})
