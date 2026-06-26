import { Badge } from '@/shared/components/ui/badge'
import EditRoleSheet from '@/modules/admin/components/roles/EditRoleSheet'
import EditRoleDialog from '@/modules/admin/components/roles/EditRoleDialog'
import CreateRoleDialog from '@/modules/admin/components/roles/CreateRoleDialog'
import StatusToggleButton from '@/modules/admin/components/StatusToggleButton'
import { ButtonGroup } from '@/shared/components/ui/button-group'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table'
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

      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader className="bg-gray-100/75">
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead className="w-20">Estado</TableHead>
              <TableHead className="w-48.5">Acciones</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {roles.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-muted-foreground text-center"
                >
                  No se encontraron roles
                </TableCell>
              </TableRow>
            ) : rolesQuery.isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-muted-foreground text-center"
                >
                  Cargando...
                </TableCell>
              </TableRow>
            ) : (
              roles.map((role) => (
                <TableRow key={role.id}>
                  <TableCell>{role.code}</TableCell>
                  <TableCell>{role.name}</TableCell>
                  <TableCell>{role.description}</TableCell>
                  <TableCell>
                    <Badge
                      className={
                        role.isActive
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-zinc-100 text-zinc-600'
                      }
                    >
                      {role.isActive ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
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
