import { z } from 'zod'

export const roleIdParamsSchema = z.object({
  id: z.string().uuid(),
})
