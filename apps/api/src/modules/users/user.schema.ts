import { z } from 'zod'

export const userIdParamsSchema = z.object({
  id: z.string().uuid(),
})

export const createUserSchema = z.object({
  username: z.string().min(3, 'El username debe tener al menos 3 caracteres'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  fullName: z.string().min(1, 'El nombre completo es requerido'),
  roleId: z.string().uuid(),
  isActive: z.boolean().optional(),
  mustChangePassword: z.boolean().optional(),
})

export const updateUserSchema = z.object({
  fullName: z.string().min(1).optional(),
  roleId: z.string().uuid().optional(),
  isActive: z.boolean().optional(),
  mustChangePassword: z.boolean().optional(),
})

export type CreateUserInput = z.infer<typeof createUserSchema>
export type UpdateUserInput = z.infer<typeof updateUserSchema>
