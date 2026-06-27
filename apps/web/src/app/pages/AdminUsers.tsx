import { DataTable } from '@/modules/admin/components/DataTable'
import StatusBadge from '@/modules/admin/components/StatusBadge'
import EditUserDialog from '@/modules/admin/components/users/EditUserDialog'
import CreateUserDialog from '@/modules/admin/components/users/CreateUserDialog'
import StatusToggleButton from '@/modules/admin/components/StatusToggleButton'
import { useUsers } from '@/modules/admin/hooks/useUsers'

export function AdminUsersPage() {
  const { usersQuery, changeUserActive } = useUsers()
  const users = usersQuery.data?.items ?? []

  return (
    <>
      <div className="mb-2 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Usuarios</h2>
          <p className="text-sm text-muted-foreground">
            Aquí puedes gestionar los usuarios del sistema, crear nuevas
            cuentas, editar información y activar o desactivar usuarios según
            sea necesario.
          </p>
        </div>

        <CreateUserDialog />
      </div>

      <DataTable
        items={users}
        isLoading={usersQuery.isLoading}
        emptyMessage="No se encontraron usuarios"
        getRowKey={(user) => user.id}
        columns={[
          {
            key: 'username',
            label: 'Usuario',
            render: (user) => user.username,
          },
          {
            key: 'fullName',
            label: 'Nombre',
            render: (user) => user.fullName,
          },
          {
            key: 'role',
            label: 'Rol',
            render: (user) => user.role.name,
          },
          {
            key: 'isActive',
            label: 'Estado',
            render: (user) => <StatusBadge isActive={user.isActive} />,
            className: 'w-20',
          },
        ]}
        actions={{
          className: 'w-29',
          render: (user) => (
            <div className="flex items-center justify-end gap-2">
              <StatusToggleButton
                isActive={user.isActive}
                onToggle={() =>
                  changeUserActive.mutate({
                    id: user.id,
                    active: !user.isActive,
                  })
                }
                label="usuario"
              />

              <EditUserDialog id={user.id} />
            </div>
          ),
        }}
      />
    </>
  )
}
