import { ChevronLeft, ChevronRight } from 'lucide-react'

import { Button } from '@/shared/components/ui/button'

type DocumentsPaginationProps = {
  page: number
  totalPages: number
  totalItems: number
  pageSize: number
  onPageChange: (page: number) => void
}

export function DocumentsPagination({
  page,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
}: DocumentsPaginationProps) {
  const startItem = totalItems === 0 ? 0 : (page - 1) * pageSize + 1
  const endItem = Math.min(page * pageSize, totalItems)

  return (
    <div className="mt-7 flex w-full items-end justify-between">
      <span className="font-semibold text-gray-700">
        Resultados: {startItem}-{endItem} de {totalItems}
      </span>

      <div className="flex items-center justify-center gap-1">
        <Button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="hover:bg-gray-200"
        >
          <ChevronLeft className="size-4" />
        </Button>

        <span className="px-3 text-sm">
          Página {page} de {totalPages || 1}
        </span>

        <Button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="hover:bg-gray-200"
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  )
}
