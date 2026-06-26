import { z } from 'zod'

export const createPermissionsFormSchema = z.object({
  code: z
    .string()
    .min(3, 'El código del permiso debe tener al menos 3 caracteres')
    .max(100, 'El código del permiso no puede superar 100 caracteres'),
  name: z
    .string()
    .min(2, 'El nombre del permiso debe tener al menos 2 caracteres')
    .max(150, 'El nombre del permiso no puede superar 150 caracteres'),
  description: z
    .string()
    .max(255, 'La descripción del permiso no puede superar 255 caracteres')
    .optional()
    .nullable(),
})

export const editPermissionsFormSchema = createPermissionsFormSchema

export type CreatePermissionsFormInput = z.infer<
  typeof createPermissionsFormSchema
>
export type EditPermissionsFormInput = z.infer<typeof editPermissionsFormSchema>
