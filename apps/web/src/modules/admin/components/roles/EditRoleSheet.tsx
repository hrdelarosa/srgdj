import { useState } from 'react'

import { Button } from '@/shared/components/ui/button'
import { Checkbox } from '@/shared/components/ui/checkbox'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/shared/components/ui/sheet'
import { useRoles } from '../../hooks/useRoles'
import { usePermissions } from '../../hooks/usePermissions'

export default function EditRoleSheet({ id }: { id: string }) {
  const [open, setOpen] = useState(false)
  const { rolePermissionsQuery } = useRoles(id)
  const { permissionsQuery, updateRolePermissions } = usePermissions()
  const permissions =
    permissionsQuery.data?.items.filter((permission) => permission.isActive) ??
    []
  const rolePermissions = rolePermissionsQuery.data?.items ?? []
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(
    new Set(),
  )

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen)

    if (nextOpen) {
      setSelectedPermissions(
        new Set(rolePermissions.map((permission) => permission.id)),
      )
    }
  }

  const handleSaveChanges = () => {
    updateRolePermissions.mutate(
      {
        id,
        data: Array.from(selectedPermissions),
      },
      {
        onSuccess: () => setOpen(false),
      },
    )
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="cursor-pointer">
          Permisos
        </Button>
      </SheetTrigger>

      <SheetContent
        side="right"
        className="data-[side=bottom]:max-h-[50vh] data-[side=top]:max-h-[50vh]"
      >
        <SheetHeader>
          <SheetTitle>Editar rol</SheetTitle>
          <SheetDescription>Modifica los datos del rol.</SheetDescription>
        </SheetHeader>

        <div className="no-scrollbar overflow-y-auto px-4 -mt-4">
          <Table className="table-fixed w-full">
            <TableHeader>
              <TableRow>
                <TableHead className="w-8"></TableHead>
                <TableHead>Permisos</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {rolePermissions.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-muted-foreground text-center"
                  >
                    No se encontraron rolePermissions
                  </TableCell>
                </TableRow>
              ) : rolePermissionsQuery.isLoading ? (
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
                  <TableRow
                    key={permission.id}
                    data-state={
                      selectedPermissions.has(permission.id)
                        ? 'selected'
                        : undefined
                    }
                  >
                    <TableCell className="w-8">
                      <Checkbox
                        id={permission.id}
                        checked={selectedPermissions.has(permission.id)}
                        onCheckedChange={(checked) => {
                          setSelectedPermissions((prev) => {
                            const next = new Set(prev)

                            if (checked === true) next.add(permission.id)
                            else next.delete(permission.id)

                            return next
                          })
                        }}
                      />
                    </TableCell>

                    <TableCell title={permission.name} className="leading-4">
                      <p className="font-medium">{permission.name}</p>
                      <small className="text-muted-foreground text-xs">
                        {permission.code}
                      </small>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <SheetFooter>
          <Button
            disabled={updateRolePermissions.isPending}
            onClick={handleSaveChanges}
          >
            Guardar cambios
          </Button>

          <SheetClose asChild>
            <Button variant="outline">Cancelar</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
