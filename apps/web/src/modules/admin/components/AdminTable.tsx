type AdminTableProps<T> = {
  items: T[]
  columns: Array<{
    key: string
    label: string
    render: (item: T) => React.ReactNode
  }>
  actions?: (item: T) => React.ReactNode
}

export function AdminTable<T>({ items, columns, actions }: AdminTableProps<T>) {
  return (
    <div className="overflow-hidden rounded-md border">
      <table className="w-full text-sm">
        <thead className="bg-muted/50">
          <tr>
            {columns.map((column) => (
              <th key={column.key} className="px-3 py-2 text-left font-medium">
                {column.label}
              </th>
            ))}
            {actions && <th className="px-3 py-2 text-right">Acciones</th>}
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={index} className="border-t">
              {columns.map((column) => (
                <td key={column.key} className="px-3 py-2">
                  {column.render(item)}
                </td>
              ))}
              {actions && (
                <td className="px-3 py-2 text-right">{actions(item)}</td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={
        active
          ? 'rounded bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700'
          : 'rounded bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600'
      }
    >
      {active ? 'Activo' : 'Inactivo'}
    </span>
  )
}
