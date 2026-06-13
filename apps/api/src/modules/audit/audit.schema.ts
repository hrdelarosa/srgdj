import { z } from 'zod'

export const auditQuerySchema = z.object({
  action: z.string().optional(),
  entityType: z.string().optional(),
  actorUserId: z.string().uuid().optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(30),
})

export type AuditQuery = z.infer<typeof auditQuerySchema>

