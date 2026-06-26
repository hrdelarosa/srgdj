import StatusToggleButton from '@/modules/admin/components/StatusToggleButton'
import EditPermissionsDialog from '@/modules/admin/components/permissions/EditPermissionsDialog'
import { Badge } from '@/shared/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table'
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

      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader className="bg-gray-100/75">
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead className="w-20">Estado</TableHead>
              <TableHead className="w-8 text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {permissions.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-muted-foreground text-center"
                >
                  No se encontraron permisos
                </TableCell>
              </TableRow>
            ) : permissionsQuery.isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-muted-foreground text-center"
                >
                  Cargando...
                </TableCell>
              </TableRow>
            ) : (
              permissions.map((permission) => (
                <TableRow key={permission.id}>
                  <TableCell>{permission.code}</TableCell>
                  <TableCell>{permission.name}</TableCell>
                  <TableCell className="truncate">
                    {permission.description ? (
                      permission.description
                    ) : (
                      <p className="text-muted-foreground">Sin descripción</p>
                    )}
                  </TableCell>
                  <TableCell>
                    {permission.isSystem ? 'Sistema' : 'Personalizado'}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={`transition-colors ${
                        permission.isActive
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-zinc-100 text-zinc-600'
                      }`}
                    >
                      {permission.isActive ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
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
