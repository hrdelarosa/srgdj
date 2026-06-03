import { z } from 'zod'

export const documentIdParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
})

export const createDocumentSchema = z.object({
  officeNumber: z.string().min(1, 'El número de oficio es requerido'),
  caseNumber: z.string().optional(),
  actor: z.string().optional(),
  defendant: z.string().optional(),
  status: z.string().min(1, 'El estado es requerido'),
})

export const updateDocumentSchema = createDocumentSchema.partial()
