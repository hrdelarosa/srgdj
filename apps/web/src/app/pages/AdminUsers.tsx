import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { adminApi, type AdminUser } from '@/modules/admin/api/admin.api'
import { AdminTable, StatusBadge } from '@/modules/admin/components/AdminTable'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'

export function AdminUsersPage() {
  const queryClient = useQueryClient()
  const usersQuery = useQuery({ queryKey: ['admin-users'], queryFn: adminApi.users })
  const rolesQuery = useQuery({ queryKey: ['admin-roles'], queryFn: adminApi.roles })
  const [editing, setEditing] = useState<AdminUser | null>(null)
  const [form, setForm] = useState({
    username: '',
    password: '',
    fullName: '',
    roleId: '',
  })

  const saveMutation = useMutation({
    mutationFn: () =>
      editing
        ? adminApi.updateUser(editing.id, {
            fullName: form.fullName,
            roleId: form.roleId,
          })
        : adminApi.createUser(form),
    onSuccess: () => {
      setEditing(null)
      setForm({ username: '', password: '', fullName: '', roleId: '' })
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
    },
  })

  const activeMutation = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      adminApi.setUserActive(id, active),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-users'] }),
  })

  function startEdit(user: AdminUser) {
    setEditing(user)
    setForm({
      username: user.username,
      password: '',
      fullName: user.fullName,
      roleId: user.role.id,
    })
  }

  return (
    <section className="space-y-5 p-6">
      <header>
        <h1 className="text-2xl font-bold">Usuarios</h1>
        <p className="text-muted-foreground">Alta, edición y activación de cuentas.</p>
      </header>

      <form
        className="grid gap-3 rounded-md border p-4 md:grid-cols-5"
        onSubmit={(event) => {
          event.preventDefault()
          saveMutation.mutate()
        }}
      >
        <Input
          placeholder="Usuario"
          value={form.username}
          disabled={Boolean(editing)}
          onChange={(event) => setForm({ ...form, username: event.target.value })}
        />
        {!editing && (
          <Input
            placeholder="Contraseña inicial"
            type="password"
            value={form.password}
            onChange={(event) => setForm({ ...form, password: event.target.value })}
          />
        )}
        <Input
          placeholder="Nombre completo"
          value={form.fullName}
          onChange={(event) => setForm({ ...form, fullName: event.target.value })}
        />
        <select
          className="border-input bg-background h-8 rounded-md border px-2 text-sm"
          value={form.roleId}
          onChange={(event) => setForm({ ...form, roleId: event.target.value })}
        >
          <option value="">Rol</option>
          {rolesQuery.data?.items.map((role) => (
            <option key={role.id} value={role.id}>
              {role.name}
            </option>
          ))}
        </select>
        <div className="flex gap-2">
          <Button type="submit" disabled={saveMutation.isPending}>
            {editing ? 'Guardar' : 'Crear'}
          </Button>
          {editing && (
            <Button type="button" variant="outline" onClick={() => setEditing(null)}>
              Cancelar
            </Button>
          )}
        </div>
      </form>

      <AdminTable
        items={usersQuery.data?.items ?? []}
        columns={[
          { key: 'username', label: 'Usuario', render: (user) => user.username },
          { key: 'fullName', label: 'Nombre', render: (user) => user.fullName },
          { key: 'role', label: 'Rol', render: (user) => user.role.name },
          {
            key: 'status',
            label: 'Estado',
            render: (user) => <StatusBadge active={user.isActive} />,
          },
        ]}
        actions={(user) => (
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => startEdit(user)}>
              Editar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                activeMutation.mutate({ id: user.id, active: !user.isActive })
              }
            >
              {user.isActive ? 'Desactivar' : 'Activar'}
            </Button>
          </div>
        )}
      />
    </section>
  )
}

