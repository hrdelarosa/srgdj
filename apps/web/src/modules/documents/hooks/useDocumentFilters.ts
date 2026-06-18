import { useState } from 'react'
import type { FindAllDocumentsParams } from '@srgdj/shared'

const DEFAULT_PAGE_SIZE = 25

export function useDocumentFilters() {
  const [inputQuery, setInputQuery] = useState('')

  const [filters, setFilters] = useState<FindAllDocumentsParams>({
    page: 1,
    pageSize: DEFAULT_PAGE_SIZE,
    query: '',
    statusId: undefined,
    documentTypeId: undefined,
  })

  function updateFilter<K extends keyof FindAllDocumentsParams>(
    key: K,
    value: FindAllDocumentsParams[K],
  ) {
    if (key === 'query') {
      setInputQuery(value as string)
      return
    }
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1,
    }))
  }

  function setDebouncedQuery(query: string) {
    setFilters((prev) => ({
      ...prev,
      query,
      page: 1,
    }))
  }

  function setPage(page: number) {
    setFilters((prev) => ({
      ...prev,
      page,
    }))
  }

  return {
    filters,
    inputQuery,
    updateFilter,
    setDebouncedQuery,
    setPage,
  }
}
