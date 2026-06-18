type PaginationRangeItem = number | 'ellipsis'

interface Props {
  page: number
  totalPages: number
  siblingCount?: number
}

export function getPaginationRange({
  page,
  totalPages,
  siblingCount = 1,
}: Props): PaginationRangeItem[] {
  const totalVisible = siblingCount * 2 + 5

  if (totalPages <= totalVisible) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }

  const leftSibling = Math.max(page - siblingCount, 1)
  const rightSibling = Math.min(page + siblingCount, totalPages)

  const showLeftEllipsis = leftSibling > 2
  const showRightEllipsis = rightSibling < totalPages - 1

  if (!showLeftEllipsis && showRightEllipsis) {
    const leftRange = Array.from(
      { length: 3 + siblingCount * 2 },
      (_, i) => i + 1,
    )
    return [...leftRange, 'ellipsis', totalPages]
  }

  if (showLeftEllipsis && !showRightEllipsis) {
    const length = 3 + siblingCount * 2
    const rightRange = Array.from(
      { length },
      (_, i) => totalPages - length + i + 1,
    )
    return [1, 'ellipsis', ...rightRange]
  }

  const middleRange = Array.from(
    { length: rightSibling - leftSibling + 1 },
    (_, i) => leftSibling + i,
  )
  return [1, 'ellipsis', ...middleRange, 'ellipsis', totalPages]
}
