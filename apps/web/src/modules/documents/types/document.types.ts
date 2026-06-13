import type { DocumentListItem } from '@srgdj/shared'

export interface DocumentEvent {
  id: string
  eventType: string
  note: string | null
  metadata: unknown
  createdAt: string
  fromStatus: {
    id: string | null
    code: string | null
    name: string | null
  }
  toStatus: {
    id: string | null
    code: string | null
    name: string | null
  }
  createdBy: {
    id: string
    name: string
    fullName: string
  }
}

export interface DocumentDetail extends DocumentListItem {
  events: DocumentEvent[]
}

export interface CreateDocumentEventInput {
  eventType: 'NOTE_ADDED' | 'STATUS_CHANGED'
  toStatusId?: string
  note?: string
  metadata?: Record<string, unknown>
}
