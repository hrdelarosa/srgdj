export function formatDate(date: Date | null | undefined) {
  if (!date) return '-'
  const valueDate = date instanceof Date ? date : new Date(date)

  return valueDate.toLocaleDateString('es-MX', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}
