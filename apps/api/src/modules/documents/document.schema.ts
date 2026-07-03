import { z } from 'zod'
import {
  findAllDocumentsQuerySchema,
  type FindAllDocumentsQuery,
} from '@srgdj/shared'

export const documentQuerySchema = findAllDocumentsQuerySchema
export type DocumentQuery = FindAllDocumentsQuery

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
