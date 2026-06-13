import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { adminApi, type Permission, type Role } from '@/modules/admin/api/admin.api'
import { AdminTable, StatusBadge } from '@/modules/admin/components/AdminTable'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'

export function AdminRolesPage() {
  const queryClient = useQueryClient()
  const rolesQuery = useQuery({ queryKey: ['admin-roles'], queryFn: adminApi.roles })
  const permissionsQuery = useQuery({
    queryKey: ['admin-permissions'],
    queryFn: adminApi.permissions,
  })
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(
    new Set(),
  )
  const [form, setForm] = useState({ code: '', name: '', description: '' })

  const rolePermissionsQuery = useQuery({
    queryKey: ['role-permissions', selectedRole?.id],
    queryFn: () => adminApi.rolePermissions(selectedRole!.id),
    enabled: Boolean(selectedRole),
  })

  const saveRoleMutation = useMutation({
    mutationFn: () =>
      selectedRole
        ? adminApi.updateRole(selectedRole.id, form)
        : adminApi.createRole({ ...form, isActive: true }),
    onSuccess: () => {
      setSelectedRole(null)
      setForm({ code: '', name: '', description: '' })
      queryClient.invalidateQueries({ queryKey: ['admin-roles'] })
    },
  })

  const savePermissionsMutation = useMutation({
    mutationFn: () =>
      adminApi.updateRolePermissions(
        selectedRole!.id,
        Array.from(selectedPermissions),
      ),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ['role-permissions', selectedRole?.id],
      }),
  })

  function editRole(role: Role) {
    setSelectedRole(role)
    setForm({
      code: role.code,
      name: role.name,
      description: role.description ?? '',
    })
  }

  function loadPermissions() {
    const current = new Set(rolePermissionsQuery.data?.items.map((item) => item.id))
    setSelectedPermissions(current)
  }

  return (
    <section className="space-y-5 p-6">
      <header>
        <h1 className="text-2xl font-bold">Roles y permisos</h1>
        <p className="text-muted-foreground">Administra roles y su matriz de permisos.</p>
      </header>

      <form
        className="grid gap-3 rounded-md border p-4 md:grid-cols-4"
        onSubmit={(event) => {
          event.preventDefault()
          saveRoleMutation.mutate()
        }}
      >
        <Input
          placeholder="Código"
          value={form.code}
          onChange={(event) => setForm({ ...form, code: event.target.value })}
        />
        <Input
          placeholder="Nombre"
          value={form.name}
          onChange={(event) => setForm({ ...form, name: event.target.value })}
        />
        <Input
          placeholder="Descripción"
          value={form.description}
          onChange={(event) =>
            setForm({ ...form, description: event.target.value })
          }
        />
        <Button type="submit">{selectedRole ? 'Guardar rol' : 'Crear rol'}</Button>
      </form>

      <div className="grid gap-5 lg:grid-cols-[1fr_420px]">
        <AdminTable
          items={rolesQuery.data?.items ?? []}
          columns={[
            { key: 'code', label: 'Código', render: (role) => role.code },
            { key: 'name', label: 'Nombre', render: (role) => role.name },
            {
              key: 'status',
              label: 'Estado',
              render: (role) => <StatusBadge active={role.isActive} />,
            },
          ]}
          actions={(role) => (
            <Button variant="outline" size="sm" onClick={() => editRole(role)}>
              Editar permisos
            </Button>
          )}
        />

        <div className="rounded-md border p-4">
          <h2 className="font-semibold">
            {selectedRole ? selectedRole.name : 'Selecciona un rol'}
          </h2>
          {selectedRole && (
            <>
              <Button
                type="button"
                variant="outline"
                className="mt-3"
                onClick={loadPermissions}
              >
                Cargar permisos actuales
              </Button>
              <div className="mt-4 max-h-[420px] space-y-2 overflow-auto">
                {(permissionsQuery.data?.items ?? []).map((permission: Permission) => (
                  <label key={permission.id} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={selectedPermissions.has(permission.id)}
                      onChange={(event) => {
                        const next = new Set(selectedPermissions)
                        if (event.target.checked) next.add(permission.id)
                        else next.delete(permission.id)
                        setSelectedPermissions(next)
                      }}
                    />
                    <span>{permission.name}</span>
                    <span className="text-muted-foreground">{permission.code}</span>
                  </label>
                ))}
              </div>
              <Button
                className="mt-4"
                disabled={savePermissionsMutation.isPending}
                onClick={() => savePermissionsMutation.mutate()}
              >
                Guardar permisos
              </Button>
            </>
          )}
        </div>
      </div>
    </section>
  )
}

