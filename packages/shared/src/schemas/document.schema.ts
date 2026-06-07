import { z } from 'zod'

const uuidSchema = z.string().trim().min(1, 'Id es requerido').max(36)

const optionalTextSchema = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value === '' ? undefined : value))

export const createDocumentSchema = z.object({
  officeNumber: z
    .string()
    .trim()
    .min(1, 'El número de oficio es requerido')
    .max(100, 'El número de oficio no puede superar 100 caracteres'),

  caseNumber: optionalTextSchema.refine(
    (value) => !value || value.length <= 100,
    'El número de expediente no puede superar 100 caracteres',
  ),

  actor: optionalTextSchema.refine(
    (value) => !value || value.length <= 255,
    'El actor no puede superar 255 caracteres',
  ),

  defendant: optionalTextSchema.refine(
    (value) => !value || value.length <= 255,
    'El demandado no puede superar 255 caracteres',
  ),

  documentTypeId: uuidSchema,

  officeDate: z.coerce.date().optional(),

  receivedDate: z.coerce.date(),

  annexes: optionalTextSchema,

  physicalLocationId: uuidSchema.optional(),

  currentStatusId: uuidSchema,

  observations: optionalTextSchema,
})

export const updateDocumentSchema = createDocumentSchema.partial()

export const documentIdParamsSchema = z.object({
  id: uuidSchema,
})

export type CreateDocumentInput = z.infer<typeof createDocumentSchema>
export type UpdateDocumentInput = z.infer<typeof updateDocumentSchema>
export type DocumentIdParams = z.infer<typeof documentIdParamsSchema>
