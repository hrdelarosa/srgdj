import { AdminTable } from '@/modules/admin/components/AdminTable'
import { formatDate } from '@/shared/lib/formatDate'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table'
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

      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader className="bg-gray-100/75">
            <TableRow>
              <TableHead>Acción</TableHead>
              <TableHead>Entidad</TableHead>
              <TableHead>Usuario</TableHead>
              <TableHead className="w-44">Fecha</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {audit.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-muted-foreground text-center"
                >
                  No se encontraron permisos
                </TableCell>
              </TableRow>
            ) : auditQuery.isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-muted-foreground text-center"
                >
                  Cargando...
                </TableCell>
              </TableRow>
            ) : (
              audit.map((permission) => (
                <TableRow key={permission.id}>
                  <TableCell>{permission.action}</TableCell>
                  <TableCell>{permission.entityType}</TableCell>
                  <TableCell>
                    {permission.actor?.username ??
                      permission.actor?.fullName ??
                      'Sin información'}
                  </TableCell>
                  <TableCell>
                    {formatDate({
                      value: permission.createdAt,
                      withTime: true,
                    })}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

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
            {
              key: 'entity',
              label: 'Entidad',
              render: (log) => log.entityType,
            },
            {
              key: 'actor',
              label: 'Usuario',
              render: (log) =>
                log.actor?.fullName ?? log.actor?.username ?? '-',
            },
            {
              key: 'date',
              label: 'Fecha',
              render: (log) => formatDate({ value: log.createdAt }),
            },
          ]}
        />
      </section>
    </>
  )
}
