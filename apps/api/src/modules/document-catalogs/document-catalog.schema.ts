import { z } from 'zod'

export const catalogIdParamsSchema = z.object({
  id: z.string().uuid(),
})

export const createDocumentTypeSchema = z.object({
  code: z.string().min(2).max(50),
  name: z.string().min(1).max(150),
  description: z.string().max(255).optional().nullable(),
  isActive: z.boolean().optional(),
})

export const updateDocumentTypeSchema = createDocumentTypeSchema.partial()

export const createDocumentStatusSchema = z.object({
  code: z.string().min(2).max(50),
  name: z.string().min(1).max(150),
  description: z.string().max(255).optional().nullable(),
  sortOrder: z.number().int().nonnegative(),
  isTerminal: z.boolean().optional(),
  isActive: z.boolean().optional(),
})

export const updateDocumentStatusSchema = createDocumentStatusSchema.partial()

export const createPhysicalLocationSchema = z.object({
  name: z.string().min(1).max(150),
  drawer: z.string().max(100).optional().nullable(),
  reference: z.string().max(255).optional().nullable(),
  isActive: z.boolean().optional(),
})

export const updatePhysicalLocationSchema =
  createPhysicalLocationSchema.partial()

export type CreateDocumentTypeInput = z.infer<typeof createDocumentTypeSchema>
export type UpdateDocumentTypeInput = z.infer<typeof updateDocumentTypeSchema>
export type CreateDocumentStatusInput = z.infer<
  typeof createDocumentStatusSchema
>
export type UpdateDocumentStatusInput = z.infer<
  typeof updateDocumentStatusSchema
>
export type CreatePhysicalLocationInput = z.infer<
  typeof createPhysicalLocationSchema
>
export type UpdatePhysicalLocationInput = z.infer<
  typeof updatePhysicalLocationSchema
>
