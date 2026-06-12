export function formatDate(value: Date | string | null | undefined) {
  if (!value) return '-'

  const date = typeof value === 'string' ? new Date(value) : value

  return new Intl.DateTimeFormat('es-MX', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date)
}
