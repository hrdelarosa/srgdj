import { z } from 'zod'

export const createUserFormSchema = z.object({
  username: z.string().min(3, 'El username debe tener al menos 3 caracteres'),
  fullName: z.string().min(1, 'El nombre completo es requerido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  roleId: z
    .string()
    .trim()
    .min(1, 'El rol es requerido')
    .max(36, 'El id del rol no puede superar 36 caracteres'),
})

export const editUserFormSchema = createUserFormSchema.omit({ password: true })

export type CreateUserFormInput = z.infer<typeof createUserFormSchema>
export type EditUserFormInput = z.infer<typeof editUserFormSchema>
