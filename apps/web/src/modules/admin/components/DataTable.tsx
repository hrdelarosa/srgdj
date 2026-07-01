import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table'

interface Props<T> {
  items: T[]
  columns: Array<{
    key: string
    label: string
    className?: string
    render: (item: T) => React.ReactNode
  }>
  isLoading?: boolean
  emptyMessage?: string
  getRowKey: (item: T) => string | number
  actions?: {
    className?: string
    render: (item: T) => React.ReactNode
  }
}

export default function DataTable<T>({
  items,
  columns,
  isLoading = false,
  emptyMessage,
  getRowKey,
  actions,
}: Props<T>) {
  const colSpan = actions ? columns.length + 1 : columns.length

  return (
    <>
      {isLoading ? (
        <div className="p-4 border rounded animate-pulse bg-gray-50 h-40" />
      ) : (
        <div className="overflow-hidden rounded-md border">
          <Table>
            <TableHeader className="bg-gray-100/75">
              <TableRow>
                {columns.map((column) => (
                  <TableHead key={column.key} className={column.className}>
                    {column.label}
                  </TableHead>
                ))}

                {actions && (
                  <TableHead className={`${actions.className} text-right`}>
                    Acciones
                  </TableHead>
                )}
              </TableRow>
            </TableHeader>

            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={colSpan}
                    className="text-muted-foreground text-center"
                  >
                    {emptyMessage || 'No se encontraron registros'}
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item) => (
                  <TableRow key={getRowKey(item)}>
                    {columns.map((column) => (
                      <TableCell key={column.key} className={column.className}>
                        {column.render(item)}
                      </TableCell>
                    ))}

                    {actions && (
                      <TableCell className={`${actions.className} text-right`}>
                        {actions.render(item)}
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </>
  )
}
