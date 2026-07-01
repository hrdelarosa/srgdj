import DataTable from '@/modules/admin/components/DataTable'
import { ButtonGroup } from '@/shared/components/ui/button-group'
import StatusBadge from '@/modules/admin/components/StatusBadge'
import EditRoleSheet from '@/modules/admin/components/roles/EditRoleSheet'
import EditRoleDialog from '@/modules/admin/components/roles/EditRoleDialog'
import CreateRoleDialog from '@/modules/admin/components/roles/CreateRoleDialog'
import StatusToggleButton from '@/modules/admin/components/StatusToggleButton'
import { useRoles } from '@/modules/admin/hooks/useRoles'

export function AdminRolesPage() {
  const { rolesQuery, changeRoleActive } = useRoles()
  const roles = rolesQuery.data?.items ?? []

  return (
    <>
      <div className="mb-2 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Roles y Permisos</h2>
          <p className="text-sm text-muted-foreground">
            Aquí puedes gestionar los roles y permisos del sistema, crear nuevos
            roles, editar información y asignar permisos según sea necesario.
          </p>
        </div>

        <CreateRoleDialog />
      </div>

      <DataTable
        items={roles}
        isLoading={rolesQuery.isLoading}
        emptyMessage="No se encontraron roles"
        getRowKey={(role) => role.id}
        columns={[
          {
            key: 'code',
            label: 'Código',
            render: (role) => role.code,
          },
          {
            key: 'name',
            label: 'Nombre',
            render: (role) => role.name,
          },
          {
            key: 'description',
            label: 'Descripción',
            render: (role) => role.description,
          },
          {
            key: 'isActive',
            label: 'Estado',
            render: (role) => <StatusBadge isActive={role.isActive} />,
            className: 'w-20',
          },
        ]}
        actions={{
          className: 'w-48.5',
          render: (role) => (
            <ButtonGroup>
              <ButtonGroup>
                <StatusToggleButton
                  isActive={role.isActive}
                  onToggle={() =>
                    changeRoleActive.mutate({
                      id: role.id,
                      active: !role.isActive,
                    })
                  }
                  label="rol"
                />
              </ButtonGroup>

              <ButtonGroup>
                <EditRoleDialog id={role.id} />
                <EditRoleSheet id={role.id} />
              </ButtonGroup>
            </ButtonGroup>
          ),
        }}
      />
    </>
  )
}
