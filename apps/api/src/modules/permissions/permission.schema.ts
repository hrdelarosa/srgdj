import { z } from 'zod'

export const permissionIdParamsSchema = z.object({
  id: z.string().uuid(),
})

export const createPermissionSchema = z.object({
  code: z.string().min(3).max(100),
  name: z.string().min(1).max(150),
  description: z.string().max(255).optional().nullable(),
  isSystem: z.boolean().optional(),
  isActive: z.boolean().optional(),
})

export const updatePermissionSchema = createPermissionSchema
  .partial()
  .omit({ code: true, isSystem: true })

export type CreatePermissionInput = z.infer<typeof createPermissionSchema>
export type UpdatePermissionInput = z.infer<typeof updatePermissionSchema>

