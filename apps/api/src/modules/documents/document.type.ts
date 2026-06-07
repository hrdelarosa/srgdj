import type { InferInsertModel } from 'drizzle-orm'
import { documents } from '../../database/schema.js'

export type DocumentUpdate = Partial<InferInsertModel<typeof documents>>
