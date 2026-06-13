import { eq } from 'drizzle-orm'
import { v7 as uuidv7 } from 'uuid'
import { db } from '../../database/db.js'
import { permissions } from '../../database/schema.js'
import type {
  CreatePermissionInput,
  UpdatePermissionInput,
} from './permission.schema.js'

export class PermissionModel {
  static async findAll() {
    return db.select().from(permissions)
  }

  static async findById({ id }: { id: string }) {
    const [permission] = await db
      .select()
      .from(permissions)
      .where(eq(permissions.id, id))
      .limit(1)

    return permission ?? null
  }

  static async create({ data }: { data: CreatePermissionInput }) {
    const id = uuidv7()

    await db.insert(permissions).values({
      id,
      code: data.code,
      name: data.name,
      description: data.description ?? null,
      isSystem: data.isSystem ?? false,
      isActive: data.isActive ?? true,
    })

    return this.findById({ id })
  }

  static async update({
    id,
    data,
  }: {
    id: string
    data: UpdatePermissionInput
  }) {
    await db
      .update(permissions)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(permissions.id, id))

    return this.findById({ id })
  }

  static async setActive({
    id,
    isActive,
  }: {
    id: string
    isActive: boolean
  }) {
    await db
      .update(permissions)
      .set({ isActive, updatedAt: new Date() })
      .where(eq(permissions.id, id))

    return this.findById({ id })
  }
}

