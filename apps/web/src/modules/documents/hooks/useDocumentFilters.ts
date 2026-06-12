// import { useState } from 'react'
// import type { FindAllDocumentsParams } from '@srgdj/shared'

// const DEFAULT_PAGE_SIZE = 20

// export function useDocumentFilters() {
//   const [filters, setFilters] = useState({
//     page: 1,
//     pageSize: DEFAULT_PAGE_SIZE,
//     query: '',
//     statusId: undefined as string | undefined,
//     documentTypeId: undefined as string | undefined,
//   })

//   function updateFilters<K extends keyof FindAllDocumentsParams>({
//     key,
//     value,
//   }: {
//     key: K
//     value: FindAllDocumentsParams[K]
//   }) {
//     setFilters((prev) => ({
//       ...prev,
//       [key]: value,
//       page: 1,
//     }))
//   }

//   function setPage({ page }: { page: number }) {
//     setFilters((prev) => ({
//       ...prev,
//       page,
//     }))
//   }

//   return {
//     filters,
//     updateFilters,
//     setPage,
//   }
// }

import { useState } from 'react'
import type { FindAllDocumentsParams } from '@srgdj/shared'

const DEFAULT_PAGE_SIZE = 10

export function useDocumentFilters() {
  // inputQuery: valor inmediato del input (controlado)
  const [inputQuery, setInputQuery] = useState('')

  // filters: lo que se manda a la API (query se actualiza con debounce desde el padre)
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
      // Solo actualiza el input visual; el padre aplica debounce antes de llamar setDebouncedQuery
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
