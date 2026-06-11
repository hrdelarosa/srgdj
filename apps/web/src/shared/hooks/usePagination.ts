import { useMemo } from 'react'

interface Props {
  currentPage: number
  totalPages: number
  itemsPerPage: number
  totalItems: number
  onPageChange: ({ page }: { page: number }) => void
}

export function usePagination({
  currentPage,
  totalPages,
  itemsPerPage,
  totalItems,
  onPageChange,
}: Props) {
  const page = currentPage
  const siblingsCount = 1
  const safeTotalPages = Math.max(totalPages, 1)

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > safeTotalPages || newPage === page) return

    onPageChange({ page: newPage })
  }

  const paginationItems = useMemo(() => {
    const pagination: number[] = [1]
    const leftSibling = Math.max(page - siblingsCount, 2)
    const rightSibling = Math.min(page + siblingsCount, safeTotalPages - 1)

    if (rightSibling > 2) pagination.push(-1)

    for (let i = leftSibling; i <= rightSibling; i++) {
      pagination.push(i)
    }

    if (rightSibling < safeTotalPages - 1) pagination.push(-2)

    if (safeTotalPages > 1) pagination.push(safeTotalPages)

    return pagination
  }, [page, safeTotalPages])

  const startItem = totalItems === 0 ? 0 : (page - 1) * itemsPerPage + 1
  const endItem = Math.min(page * itemsPerPage, totalItems)

  return {
    page,
    totalPages: safeTotalPages,
    startItem,
    endItem,
    totalItems,
    paginationItems,
    handlePageChange,
  }
}
