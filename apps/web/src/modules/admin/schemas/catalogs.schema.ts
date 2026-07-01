import { z } from 'zod'

export const createDocumentTypesFormSchema = z.object({
  code: z
    .string()
    .min(2, 'El código debe tener al menos 2 caracteres')
    .max(50, 'El código no puede exceder 50 caracteres'),
  name: z
    .string()
    .min(1, 'El nombre es requerido')
    .max(150, 'El nombre no puede exceder 150 caracteres'),
  description: z
    .string()
    .max(255, 'La descripción no puede exceder 255 caracteres')
    .optional()
    .nullable(),
  isActive: z.boolean().optional(),
})

export const createDocumentStatusesFormSchema = z.object({
  code: z
    .string()
    .min(2, 'El código debe tener al menos 2 caracteres')
    .max(50, 'El código no puede exceder 50 caracteres'),
  name: z
    .string()
    .min(1, 'El nombre es requerido')
    .max(150, 'El nombre no puede exceder 150 caracteres'),
  description: z
    .string()
    .max(255, 'La descripción no puede exceder 255 caracteres')
    .optional()
    .nullable(),
  sortOrder: z
    .number()
    .int()
    .nonnegative('El orden debe ser un número entero no negativo'),
  isTerminal: z.boolean().optional(),
  isActive: z.boolean().optional(),
})

export const createPhysicalLocationsFormSchema = z.object({
  name: z
    .string()
    .min(1, 'El nombre es requerido')
    .max(150, 'El nombre no puede exceder 150 caracteres'),
  drawer: z
    .string()
    .max(100, 'La gaveta no puede exceder 100 caracteres')
    .optional()
    .nullable(),
  reference: z
    .string()
    .max(255, 'La referencia no puede exceder 255 caracteres')
    .optional()
    .nullable(),
  isActive: z.boolean().optional(),
})

export const editDocumentTypesFormSchema = createDocumentTypesFormSchema
export const editDocumentStatusesFormSchema = createDocumentStatusesFormSchema
export const editPhysicalLocationsFormSchema = createPhysicalLocationsFormSchema

export type CreateDocumentTypesFormInput = z.infer<
  typeof createDocumentTypesFormSchema
>
export type CreateDocumentStatusesFormInput = z.infer<
  typeof createDocumentStatusesFormSchema
>
export type CreatePhysicalLocationsFormInput = z.infer<
  typeof createPhysicalLocationsFormSchema
>
