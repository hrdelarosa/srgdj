export interface CatalogResponse<T> {
  items: T[]
}

export interface DocumentTypeOption {
  id: string
  code: string
  name: string
  description: string | null
}

export interface DocumentStatusOption {
  id: string
  code: string
  name: string
  description: string | null
  sortOrder: number
  isTerminal: boolean
}
