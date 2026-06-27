import { v7 as uuidv7 } from 'uuid'
import { eq } from 'drizzle-orm'
import { db } from '../../database/db.js'
import { roles, users } from '../../database/schema.js'
import { CreateUserData } from './user.type.js'
import { UpdateUserInput } from './user.schema.js'

export class UserModel {
  static async findAll() {
    return db
      .select({
        id: users.id,
        username: users.username,
        fullName: users.fullName,
        isActive: users.isActive,
        mustChangePassword: users.mustChangePassword,
        lastLoginAt: users.lastLoginAt,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
        role: {
          id: roles.id,
          code: roles.code,
          name: roles.name,
        },
      })
      .from(users)
      .innerJoin(roles, eq(users.roleId, roles.id))
  }

  static async findById({ id }: { id: string }) {
    const [user] = await db
      .select({
        id: users.id,
        username: users.username,
        fullName: users.fullName,
        isActive: users.isActive,
        mustChangePassword: users.mustChangePassword,
        lastLoginAt: users.lastLoginAt,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
        role: {
          id: roles.id,
          code: roles.code,
          name: roles.name,
        },
      })
      .from(users)
      .innerJoin(roles, eq(users.roleId, roles.id))
      .where(eq(users.id, id))
      .limit(1)

    return user ?? null
  }

  static async findByUsername({ username }: { username: string }) {
    const [user] = await db
      .select({
        id: users.id,
      })
      .from(users)
      .where(eq(users.username, username))
      .limit(1)

    return user ?? null
  }

  static async findRoleById({ roleId }: { roleId: string }) {
    const [role] = await db
      .select({
        id: roles.id,
        code: roles.code,
        name: roles.name,
        isActive: roles.isActive,
      })
      .from(roles)
      .where(eq(roles.id, roleId))
      .limit(1)

    return role ?? null
  }

  static async create({ data }: { data: CreateUserData }) {
    const userId = uuidv7()

    await db
      .insert(users)
      .values({ id: userId, ...data })
      .$returningId()

    return this.findById({ id: userId })
  }

  static async update({ id, data }: { id: string; data: UpdateUserInput }) {
    await db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))

    return this.findById({ id })
  }

  static async setActive({ id, isActive }: { id: string; isActive: boolean }) {
    await db
      .update(users)
      .set({ isActive, updatedAt: new Date() })
      .where(eq(users.id, id))

    return this.findById({ id })
  }
}
