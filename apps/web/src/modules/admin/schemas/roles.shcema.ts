import { z } from 'zod'

export const createRoleFormSchema = z.object({
  code: z
    .string()
    .min(2, 'El código del rol debe tener al menos 2 caracteres')
    .max(50, 'El código del rol no puede superar 50 caracteres'),
  name: z
    .string()
    .min(2, 'El nombre del rol debe tener al menos 2 caracteres')
    .max(100, 'El nombre del rol no puede superar 100 caracteres'),
  description: z
    .string()
    .max(255, 'La descripción del rol no puede superar 255 caracteres')
    .optional()
    .nullable(),
})

export const editRoleFormSchema = createRoleFormSchema

export type CreateRoleFormInput = z.infer<typeof createRoleFormSchema>
export type EditRoleFormInput = z.infer<typeof editRoleFormSchema>
