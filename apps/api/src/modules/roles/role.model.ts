import { eq, inArray } from 'drizzle-orm'
import { v7 as uuidv7 } from 'uuid'
import { db } from '../../database/db.js'
import { permissions, rolePermissions, roles } from '../../database/schema.js'
import type {
  CreateRoleInput,
  UpdateRoleInput,
  UpdateRolePermissionsInput,
} from './role.schema.js'

export class RoleModel {
  static async findAll() {
    return await db
      .select({
        id: roles.id,
        code: roles.code,
        name: roles.name,
        description: roles.description,
        isActive: roles.isActive,
        createdAt: roles.createdAt,
        updatedAt: roles.updatedAt,
      })
      .from(roles)
  }

  static async findById({ id }: { id: string }) {
    const [role] = await db
      .select({
        id: roles.id,
        code: roles.code,
        name: roles.name,
        description: roles.description,
        isActive: roles.isActive,
        createdAt: roles.createdAt,
        updatedAt: roles.updatedAt,
      })
      .from(roles)
      .where(eq(roles.id, id))
      .limit(1)

    return role ?? null
  }

  static async create({ data }: { data: CreateRoleInput }) {
    const id = uuidv7()

    await db.insert(roles).values({
      id,
      code: data.code,
      name: data.name,
      description: data.description ?? null,
      isActive: data.isActive ?? true,
    })

    return this.findById({ id })
  }

  static async update({ id, data }: { id: string; data: UpdateRoleInput }) {
    await db
      .update(roles)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(roles.id, id))

    return this.findById({ id })
  }

  static async setActive({ id, isActive }: { id: string; isActive: boolean }) {
    await db
      .update(roles)
      .set({ isActive, updatedAt: new Date() })
      .where(eq(roles.id, id))

    return this.findById({ id })
  }

  static async findPermissionsByRoleId({ id }: { id: string }) {
    return db
      .select({
        id: permissions.id,
        code: permissions.code,
        name: permissions.name,
        description: permissions.description,
        isSystem: permissions.isSystem,
        isActive: permissions.isActive,
      })
      .from(rolePermissions)
      .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
      .where(eq(rolePermissions.roleId, id))
  }

  static async updatePermissions({
    id,
    data,
  }: {
    id: string
    data: UpdateRolePermissionsInput
  }) {
    await db.transaction(async (tx) => {
      await tx.delete(rolePermissions).where(eq(rolePermissions.roleId, id))

      if (data.permissionIds.length === 0) return

      const validPermissions = await tx
        .select({ id: permissions.id })
        .from(permissions)
        .where(inArray(permissions.id, data.permissionIds))

      await tx.insert(rolePermissions).values(
        validPermissions.map((permission) => ({
          roleId: id,
          permissionId: permission.id,
        })),
      )
    })

    return this.findPermissionsByRoleId({ id })
  }
}
