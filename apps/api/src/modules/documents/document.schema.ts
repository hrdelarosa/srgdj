import { z } from 'zod'

export const documentQuerySchema = z.object({
  q: z.string().optional(),

  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(30),

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

export type DocumentQuery = z.infer<typeof documentQuerySchema>

export const createDocumentEventSchema = z.object({
  eventType: z.enum([
    'NOTE_ADDED',
    'STATUS_CHANGED',
    'LOCATION_UPDATED',
    'UPDATED',
  ]),

  toStatusId: z.string().uuid().optional(),
  note: z.string().min(1, 'La nota es requerida').optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
})

export type CreateDocumentEventInput = z.infer<typeof createDocumentEventSchema>
