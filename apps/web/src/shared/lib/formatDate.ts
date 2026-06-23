interface FormatDateOptions {
  value: Date | string | null | undefined
  withTime?: boolean
  monthFormat?: '2-digit' | 'long'
}

export function formatDate({
  value,
  withTime = false,
  monthFormat = '2-digit',
}: FormatDateOptions): string {
  if (!value) return '-'

  const date = toDisplayDate(value)

  return new Intl.DateTimeFormat('es-MX', {
    day: '2-digit',
    month: monthFormat,
    year: 'numeric',
    ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {}),
  }).format(date)
}

export function getDateInputValue(value: Date | string | null | undefined) {
  if (!value) return ''

  if (typeof value === 'string') {
    const dateOnly = value.match(/^\d{4}-\d{2}-\d{2}/)?.[0]
    if (dateOnly) return dateOnly
  }

  const date = toDisplayDate(value)

  if (Number.isNaN(date.getTime())) return ''

  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-')
}

function toDisplayDate(value: Date | string) {
  if (typeof value !== 'string') return value

  const dateOnly = value.match(/^(\d{4})-(\d{2})-(\d{2})$/)?.slice(1)

  if (dateOnly) {
    const [year, month, day] = dateOnly.map(Number)

    return new Date(year!, month! - 1, day!)
  }

  return new Date(value)
}
