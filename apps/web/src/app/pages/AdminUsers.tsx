import { Badge } from '@/shared/components/ui/badge'
import EditUserDialog from '@/modules/admin/components/users/EditUserDialog'
import CreateUserDialog from '@/modules/admin/components/users/CreateUserDialog'
import StatusToggleButton from '@/modules/admin/components/StatusToggleButton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table'
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

      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader className="bg-gray-100">
            <TableRow>
              <TableHead>Usuario</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="w-8 text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-muted-foreground text-center"
                >
                  No se encontraron usuarios
                </TableCell>
              </TableRow>
            ) : usersQuery.isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-muted-foreground text-center"
                >
                  Cargando...
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.fullName}</TableCell>
                  <TableCell>{user.role.name}</TableCell>
                  <TableCell>
                    <Badge
                      className={
                        user.isActive
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-zinc-100 text-zinc-600'
                      }
                    >
                      {user.isActive ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
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
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </>
  )
}
