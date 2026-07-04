import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  nextSelectResult: [] as unknown[],
  nextInsertResult: [] as unknown[],
  nextSessionResult: [] as unknown[],
  whereArgs: [] as unknown[],
  setArgs: [] as unknown[],
  valuesArgs: [] as unknown[],
  findManyArgs: [] as unknown[],
}))

function createSelectBuilder() {
  const builder = {
    from: vi.fn(() => builder),
    innerJoin: vi.fn(() => builder),
    where: vi.fn((condition) => {
      mocks.whereArgs.push(condition)
      return builder
    }),
    orderBy: vi.fn(() => builder),
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

vi.mock('drizzle-orm', async (importOriginal) => {
  const actual = await importOriginal<typeof import('drizzle-orm')>()

  return {
    ...actual,
    and: (...conditions: unknown[]) => ({ op: 'and', conditions }),
    desc: (column: unknown) => ({ direction: 'desc', column }),
    eq: (left: unknown, right: unknown) => ({ op: 'eq', left, right }),
    isNull: (column: unknown) => ({ op: 'isNull', column }),
  }
})

vi.mock('../../database/db.js', () => ({
  db: {
    select: vi.fn(() => createSelectBuilder()),
    insert: vi.fn(() => ({
      values: vi.fn((data) => {
        mocks.valuesArgs.push(data)
        return Promise.resolve(mocks.nextInsertResult)
      }),
    })),
    update: vi.fn(() => createUpdateBuilder()),
    query: {
      userSessions: {
        findMany: vi.fn((args) => {
          mocks.findManyArgs.push(args)
          return Promise.resolve(mocks.nextSessionResult)
        }),
      },
    },
  },
}))

const { AuthModel } = await import('./auth.model.js')

const user = {
  id: '019e9bc2-a9d6-74c9-adad-9cad76f1d9e1',
  username: 'admin',
}

const session = {
  id: '019e9bc2-a9d6-74c9-adad-9cad76f1d9f1',
  userId: user.id,
}

beforeEach(() => {
  mocks.nextSelectResult = []
  mocks.nextInsertResult = []
  mocks.nextSessionResult = []
  mocks.whereArgs = []
  mocks.setArgs = []
  mocks.valuesArgs = []
  mocks.findManyArgs = []
})

describe('AuthModel', () => {
  it('findUserByUsername returns the matched user', async () => {
    mocks.nextSelectResult = [user]

    const result = await AuthModel.findUserByUsername({ username: 'admin' })

    expect(result).toBe(user)
    expect(mocks.whereArgs[0]).toMatchObject({ op: 'eq' })
  })

  it('findUserByUsername returns null when missing', async () => {
    const result = await AuthModel.findUserByUsername({ username: 'missing' })

    expect(result).toBeNull()
  })

  it('creates sessions with the provided token hashes', async () => {
    mocks.nextInsertResult = [session]

    const result = await AuthModel.createSession({
      data: {
        userId: user.id,
        tokenHash: 'access-hash',
        refreshTokenHash: 'refresh-hash',
        expiresAt: new Date('2026-07-10'),
        lastActivityAt: new Date('2026-07-03'),
        createdByIp: '127.0.0.1',
        userAgent: 'vitest',
      },
    })

    expect(result).toBe(session)
    expect(mocks.valuesArgs[0]).toMatchObject({
      userId: user.id,
      tokenHash: 'access-hash',
      refreshTokenHash: 'refresh-hash',
    })
  })

  it('findValidSessionByTokenHash returns a session or null', async () => {
    mocks.nextSessionResult = [session]

    await expect(
      AuthModel.findValidSessionByTokenHash({ tokenHash: 'access-hash' }),
    ).resolves.toBe(session)

    mocks.nextSessionResult = []

    await expect(
      AuthModel.findValidSessionByTokenHash({ tokenHash: 'missing' }),
    ).resolves.toBeNull()
  })

  it('findValidSessionByRefreshTokenHash returns a session or null', async () => {
    mocks.nextSessionResult = [session]

    await expect(
      AuthModel.findValidSessionByRefreshTokenHash({
        refreshTokenHash: 'refresh-hash',
      }),
    ).resolves.toBe(session)

    mocks.nextSessionResult = []

    await expect(
      AuthModel.findValidSessionByRefreshTokenHash({
        refreshTokenHash: 'missing',
      }),
    ).resolves.toBeNull()
  })

  it('updates last login and session activity fields', async () => {
    const date = new Date('2026-07-03T10:00:00Z')

    await AuthModel.updateLastLogin({ id: user.id })
    await AuthModel.touchSession({ sessionId: session.id, date })

    expect(mocks.setArgs[0]).toMatchObject({
      lastLoginAt: expect.any(Date),
      updatedAt: expect.any(Date),
    })
    expect(mocks.setArgs[1]).toEqual({ lastActivityAt: date })
  })

  it('rotates and revokes sessions', async () => {
    const date = new Date('2026-07-03T10:00:00Z')

    await AuthModel.rotateSession({
      sessionId: session.id,
      tokenHash: 'new-access',
      refreshTokenHash: 'new-refresh',
      expiresAt: date,
      date,
    })
    await AuthModel.revokeSession({ sessionId: session.id, reason: 'logout' })

    expect(mocks.setArgs[0]).toMatchObject({
      tokenHash: 'new-access',
      refreshTokenHash: 'new-refresh',
      rotatedAt: date,
    })
    expect(mocks.setArgs[1]).toMatchObject({
      revokedAt: expect.any(Date),
      revokedReason: 'logout',
    })
  })

  it('lists sessions and permissions for a user role', async () => {
    mocks.nextSelectResult = [session]

    await expect(
      AuthModel.findSessionsByUserId({ userId: user.id }),
    ).resolves.toEqual([session])

    mocks.nextSelectResult = [{ code: 'documents:read' }]

    await expect(
      AuthModel.findPermissionsByRoleId({
        roleId: '019e9bc2-a9d6-74c9-adad-9cad76f1d9e2',
      }),
    ).resolves.toEqual([{ code: 'documents:read' }])
  })
})
