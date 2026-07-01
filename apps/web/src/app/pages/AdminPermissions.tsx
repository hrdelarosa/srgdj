import DataTable from '@/modules/admin/components/DataTable'
import StatusBadge from '@/modules/admin/components/StatusBadge'
import StatusToggleButton from '@/modules/admin/components/StatusToggleButton'
import EditPermissionsDialog from '@/modules/admin/components/permissions/EditPermissionsDialog'
import CreatePermissionsDialog from '@/modules/admin/components/permissions/CreatePermissionsDialog'
import { usePermissions } from '@/modules/admin/hooks/usePermissions'

export function AdminPermissionsPage() {
  const { permissionsQuery, changePermissionsActive } = usePermissions()
  const permissions = permissionsQuery.data?.items ?? []

  return (
    <>
      <div className="mb-2 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Permisos</h2>
          <p className="text-sm text-muted-foreground">
            Aquí puedes gestionar los permios del sistema, crear nuevos
            permisos, editar información y activar o desactivar permisos según
            sea necesario.
          </p>
        </div>

        <CreatePermissionsDialog />
      </div>

      <DataTable
        items={permissions}
        isLoading={permissionsQuery.isLoading}
        emptyMessage="No se encontraron permisos"
        getRowKey={(permission) => permission.id}
        columns={[
          {
            key: 'code',
            label: 'Código',
            render: (permission) => permission.code,
          },
          {
            key: 'name',
            label: 'Nombre',
            render: (permission) => permission.name,
          },
          {
            key: 'description',
            label: 'Descripción',
            render: (permission) =>
              permission.description ? (
                permission.description
              ) : (
                <p className="text-muted-foreground">Sin descripción</p>
              ),
          },
          {
            key: 'isActive',
            label: 'Estado',
            render: (permission) => (
              <StatusBadge isActive={permission.isActive} />
            ),
            className: 'w-20',
          },
        ]}
        actions={{
          className: 'w-48.5',
          render: (permission) => (
            <div className="flex items-center justify-end gap-2">
              <StatusToggleButton
                isActive={permission.isActive}
                onToggle={() =>
                  changePermissionsActive.mutate({
                    id: permission.id,
                    active: !permission.isActive,
                  })
                }
                label="permiso"
              />

              <EditPermissionsDialog id={permission.id} />
            </div>
          ),
        }}
      />
    </>
  )
}
