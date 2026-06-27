import { and, desc, eq, isNull } from 'drizzle-orm'
import { db } from '../../database/db.js'
import {
  permissions,
  rolePermissions,
  roles,
  users,
  userSessions,
} from '../../database/schema.js'
import { CreateSession } from './auth.type.js'

export class AuthModel {
  static async findUserByUsername({ username }: { username: string }) {
    const [user] = await db
      .select({
        id: users.id,
        username: users.username,
        passwordHash: users.passwordHash,
        fullName: users.fullName,
        isActive: users.isActive,
        mustChangePassword: users.mustChangePassword,
        role: {
          id: roles.id,
          code: roles.code,
          name: roles.name,
          isActive: roles.isActive,
        },
      })
      .from(users)
      .innerJoin(roles, eq(users.roleId, roles.id))
      .where(eq(users.username, username))
      .limit(1)

    return user ?? null
  }

  static async createSession({ data }: { data: CreateSession }) {
    const [session] = await db.insert(userSessions).values(data)

    return session
  }

  static async updateLastLogin({ id }: { id: string }) {
    await db
      .update(users)
      .set({
        lastLoginAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
  }

  static async findValidSessionByTokenHash({
    tokenHash,
  }: {
    tokenHash: string
  }) {
    const [session] = await db.query.userSessions.findMany({
      where: (userSessions, { eq }) => eq(userSessions.tokenHash, tokenHash),
      with: {
        user: {
          columns: {
            id: true,
            username: true,
            isActive: true,
          },
          with: {
            role: {
              columns: {
                id: true,
                code: true,
                name: true,
                isActive: true,
              },
            },
          },
        },
      },
      limit: 1,
    })

    return session ?? null
  }

  static async findValidSessionByRefreshTokenHash({
    refreshTokenHash,
  }: {
    refreshTokenHash: string
  }) {
    const [session] = await db.query.userSessions.findMany({
      where: (userSessions, { eq }) =>
        eq(userSessions.refreshTokenHash, refreshTokenHash),
      with: {
        user: {
          columns: {
            id: true,
            username: true,
            fullName: true,
            isActive: true,
            mustChangePassword: true,
          },
          with: {
            role: {
              columns: {
                id: true,
                code: true,
                name: true,
                isActive: true,
              },
            },
          },
        },
      },
      limit: 1,
    })

    return session ?? null
  }

  static async touchSession({
    sessionId,
    date,
  }: {
    sessionId: string
    date: Date
  }) {
    await db
      .update(userSessions)
      .set({ lastActivityAt: date })
      .where(eq(userSessions.id, sessionId))
  }

  static async rotateSession({
    sessionId,
    tokenHash,
    refreshTokenHash,
    expiresAt,
    date,
  }: {
    sessionId: string
    tokenHash: string
    refreshTokenHash: string
    expiresAt: Date
    date: Date
  }) {
    await db
      .update(userSessions)
      .set({
        tokenHash,
        refreshTokenHash,
        expiresAt,
        lastActivityAt: date,
        rotatedAt: date,
      })
      .where(eq(userSessions.id, sessionId))
  }

  static async revokeSession({
    sessionId,
    reason,
  }: {
    sessionId: string
    reason?: string
  }) {
    await db
      .update(userSessions)
      .set({ revokedAt: new Date(), revokedReason: reason ?? null })
      .where(eq(userSessions.id, sessionId))
  }

  static async findSessionsByUserId({ userId }: { userId: string }) {
    return db
      .select({
        id: userSessions.id,
        expiresAt: userSessions.expiresAt,
        lastActivityAt: userSessions.lastActivityAt,
        revokedAt: userSessions.revokedAt,
        revokedReason: userSessions.revokedReason,
        createdAt: userSessions.createdAt,
        createdByIp: userSessions.createdByIp,
        userAgent: userSessions.userAgent,
      })
      .from(userSessions)
      .where(eq(userSessions.userId, userId))
      .orderBy(desc(userSessions.createdAt))
  }

  static async findPermissionsByRoleId({ roleId }: { roleId: string }) {
    return db
      .select({ code: permissions.code })
      .from(rolePermissions)
      .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
      .where(
        and(eq(rolePermissions.roleId, roleId), eq(permissions.isActive, true)),
      )
  }
}
