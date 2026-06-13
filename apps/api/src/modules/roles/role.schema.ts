import { z } from 'zod'

export const roleIdParamsSchema = z.object({
  id: z.string().uuid(),
})

export const createRoleSchema = z.object({
  code: z.string().min(2).max(50),
  name: z.string().min(1).max(100),
  description: z.string().max(255).optional().nullable(),
  isActive: z.boolean().optional(),
})

export const updateRoleSchema = createRoleSchema.partial()

export const updateRolePermissionsSchema = z.object({
  permissionIds: z.array(z.string().uuid()),
})

export type CreateRoleInput = z.infer<typeof createRoleSchema>
export type UpdateRoleInput = z.infer<typeof updateRoleSchema>
export type UpdateRolePermissionsInput = z.infer<
  typeof updateRolePermissionsSchema
>
