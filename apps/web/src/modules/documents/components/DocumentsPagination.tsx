import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/shared/components/ui/pagination'
import { getPaginationRange } from '@/shared/lib/getPaginationRange'

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
  const safeTotalPages = totalPages || 1
  const range = getPaginationRange({
    page,
    totalPages: safeTotalPages,
  })

  const isFirstPage = page <= 1
  const isLastPage = page >= safeTotalPages

  return (
    <div className="mt-7 flex w-full items-end justify-between">
      <span className="font-semibold text-gray-700">
        Resultados: {startItem}-{endItem} de {totalItems}
      </span>

      <Pagination className="mx-0 w-auto">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={(e) => {
                e.preventDefault()
                if (!isFirstPage) onPageChange(page - 1)
              }}
              aria-disabled={isFirstPage}
              className={
                isFirstPage ? 'pointer-events-none opacity-50' : undefined
              }
            />
          </PaginationItem>

          {range.map((item, index) =>
            item === 'ellipsis' ? (
              <PaginationItem key={`ellipsis-${index}`}>
                <PaginationEllipsis />
              </PaginationItem>
            ) : (
              <PaginationItem key={item} className="">
                <PaginationLink
                  href="#"
                  isActive={item === page}
                  onClick={(e) => {
                    e.preventDefault()
                    onPageChange(item)
                  }}
                >
                  {item}
                </PaginationLink>
              </PaginationItem>
            ),
          )}

          <PaginationItem>
            <PaginationNext
              href="#"
              onClick={(e) => {
                e.preventDefault()
                if (!isLastPage) onPageChange(page + 1)
              }}
              aria-disabled={isLastPage}
              className={
                isLastPage ? 'pointer-events-none opacity-50' : undefined
              }
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  )
}
