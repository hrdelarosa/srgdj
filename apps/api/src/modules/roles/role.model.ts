import { eq } from 'drizzle-orm'
import { db } from '../../database/db.js'
import { roles } from '../../database/schema.js'

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
      })
      .from(roles)
      .where(eq(roles.id, id))
      .limit(1)

    return role ?? null
  }
}
