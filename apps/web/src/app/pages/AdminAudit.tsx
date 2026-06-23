import { useQuery } from '@tanstack/react-query'
import { adminApi } from '@/modules/admin/api/admin.api'
import { AdminTable } from '@/modules/admin/components/AdminTable'
import { formatDate } from '@/shared/lib/formatDate'

export function AdminAuditPage() {
  const auditQuery = useQuery({
    queryKey: ['admin-audit'],
    queryFn: adminApi.auditLogs,
  })

  return (
    <section className="space-y-5 p-6">
      <header>
        <h1 className="text-2xl font-bold">Auditoría</h1>
        <p className="text-muted-foreground">
          Registro de accesos y acciones sensibles.
        </p>
      </header>

      <AdminTable
        items={auditQuery.data?.items ?? []}
        columns={[
          { key: 'action', label: 'Acción', render: (log) => log.action },
          { key: 'entity', label: 'Entidad', render: (log) => log.entityType },
          {
            key: 'actor',
            label: 'Usuario',
            render: (log) => log.actor?.fullName ?? log.actor?.username ?? '-',
          },
          {
            key: 'date',
            label: 'Fecha',
            render: (log) => formatDate({ value: log.createdAt }),
          },
        ]}
      />
    </section>
  )
}
