import { z } from 'zod'

const uuidSchema = (message = 'Id es requerido') =>
  z
    .string()
    .trim()
    .min(1, message)
    .max(36, 'El id no puede superar 36 caracteres')

const optionalIdSchema = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value === '' ? undefined : value))

const optionalTextSchema = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value === '' ? undefined : value))

const optionalQueryTextSchema = z.preprocess(
  (value) => (value === '' ? undefined : value),
  z.string().trim().optional(),
)

const localDateSchema = (message: string) =>
  z
    .string({ error: message })
    .trim()
    .min(1, message)
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'La fecha no es válida')

const optionalLocalDateSchema = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value === '' ? undefined : value))
  .refine((value) => !value || /^\d{4}-\d{2}-\d{2}$/.test(value), {
    message: 'La fecha no es válida',
  })

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

  documentTypeId: uuidSchema('El tipo de documento es requerido'),

  officeDate: optionalLocalDateSchema,

  receivedDate: localDateSchema(
    'La fecha de recibido es obligatoria o no es válida',
  ),

  annexes: optionalTextSchema,

  physicalLocationId: optionalIdSchema,

  currentStatusId: uuidSchema('El estatus inicial es requerido'),

  observations: optionalTextSchema,
})

export const updateDocumentSchema = createDocumentSchema.partial()

export const documentIdParamsSchema = z.object({
  id: uuidSchema('El id del documento es requerido'),
})

export const findAllDocumentsQuerySchema = z.object({
  q: optionalQueryTextSchema,

  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(30),

  officeNumber: z.string().optional(),
  caseNumber: z.string().optional(),
  actor: z.string().optional(),
  defendant: z.string().optional(),

  documentTypeId: z.string().uuid().optional(),
  currentStatusId: z.string().uuid().optional(),

  receivedDateFrom: z.coerce.date().optional(),
  receivedDateTo: z.coerce.date().optional(),

  sortBy: z
    .enum(['officeDate', 'receivedDate', 'documentType', 'status', 'createdAt'])
    .default('createdAt'),

  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

export type CreateDocumentFormTypes = z.infer<typeof createDocumentSchema>
export type CreateDocumentFormInput = z.input<typeof createDocumentSchema>
export type CreateDocumentInput = z.output<typeof createDocumentSchema>
// export type CreateDocumentInput = z.infer<typeof createDocumentSchema>
export type UpdateDocumentFormInput = z.input<typeof updateDocumentSchema>
export type UpdateDocumentSubmitInput = z.output<typeof updateDocumentSchema>
export type UpdateDocumentInput = z.infer<typeof updateDocumentSchema>
export type DocumentIdParams = z.infer<typeof documentIdParamsSchema>
export type FindAllDocumentsQuery = z.infer<typeof findAllDocumentsQuerySchema>
