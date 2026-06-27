import { formatDate } from '@/shared/lib/formatDate'
import { DataTable } from '@/modules/admin/components/DataTable'
import { useAudit } from '@/modules/admin/hooks/useAudit'

export function AdminAuditPage() {
  const { auditQuery } = useAudit()
  const audit = auditQuery.data?.items ?? []

  return (
    <>
      <div className="mb-2">
        <h2 className="text-2xl font-bold">Auditoría</h2>
        <p className="text-sm text-muted-foreground">
          Registro de accesos y acciones sensibles.
        </p>
      </div>

      <DataTable
        items={audit}
        isLoading={auditQuery.isLoading}
        emptyMessage="No se encontraron registros de auditoría"
        getRowKey={(log) => log.id}
        columns={[
          {
            key: 'action',
            label: 'Acción',
            render: (log) => log.action,
          },
          {
            key: 'entityType',
            label: 'Entidad',
            render: (log) => log.entityType,
          },
          {
            key: 'actor',
            label: 'Usuario',
            render: (log) =>
              log.actor?.username ?? log.actor?.fullName ?? 'Sin información',
          },
          {
            key: 'createdAt',
            label: 'Fecha',
            render: (log) =>
              formatDate({
                value: log.createdAt,
                withTime: true,
              }),
            className: 'w-44',
          },
        ]}
      />
    </>
  )
}
