import { eq } from 'drizzle-orm'
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
          },
          with: {
            role: {
              columns: {
                id: true,
                code: true,
                name: true,
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

  static async revokeSession({ sessionId }: { sessionId: string }) {
    await db
      .update(userSessions)
      .set({ revokedAt: new Date() })
      .where(eq(userSessions.id, sessionId))
  }

  static async findPermissionsByRoleId({ roleId }: { roleId: string }) {
    return db
      .select({ code: permissions.code })
      .from(rolePermissions)
      .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
      .where(eq(rolePermissions.roleId, roleId))
  }
}
