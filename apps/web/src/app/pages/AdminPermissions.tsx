import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { adminApi, type Permission } from '@/modules/admin/api/admin.api'
import { AdminTable, StatusBadge } from '@/modules/admin/components/AdminTable'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'

export function AdminPermissionsPage() {
  const queryClient = useQueryClient()
  const permissionsQuery = useQuery({
    queryKey: ['admin-permissions'],
    queryFn: adminApi.permissions,
  })
  const [editing, setEditing] = useState<Permission | null>(null)
  const [form, setForm] = useState({ code: '', name: '', description: '' })

  const saveMutation = useMutation({
    mutationFn: () =>
      editing
        ? adminApi.updatePermission(editing.id, {
            name: form.name,
            description: form.description,
          })
        : adminApi.createPermission({ ...form, isSystem: false, isActive: true }),
    onSuccess: () => {
      setEditing(null)
      setForm({ code: '', name: '', description: '' })
      queryClient.invalidateQueries({ queryKey: ['admin-permissions'] })
    },
  })

  function edit(permission: Permission) {
    setEditing(permission)
    setForm({
      code: permission.code,
      name: permission.name,
      description: permission.description ?? '',
    })
  }

  return (
    <section className="space-y-5 p-6">
      <header>
        <h1 className="text-2xl font-bold">Permisos</h1>
        <p className="text-muted-foreground">
          Permisos de sistema y personalizados para crecimiento futuro.
        </p>
      </header>

      <form
        className="grid gap-3 rounded-md border p-4 md:grid-cols-4"
        onSubmit={(event) => {
          event.preventDefault()
          saveMutation.mutate()
        }}
      >
        <Input
          placeholder="Código"
          value={form.code}
          disabled={Boolean(editing)}
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
        <Button type="submit">{editing ? 'Guardar' : 'Crear permiso'}</Button>
      </form>

      <AdminTable
        items={permissionsQuery.data?.items ?? []}
        columns={[
          { key: 'code', label: 'Código', render: (permission) => permission.code },
          { key: 'name', label: 'Nombre', render: (permission) => permission.name },
          {
            key: 'kind',
            label: 'Tipo',
            render: (permission) =>
              permission.isSystem ? 'Sistema' : 'Personalizado',
          },
          {
            key: 'status',
            label: 'Estado',
            render: (permission) => <StatusBadge active={permission.isActive} />,
          },
        ]}
        actions={(permission) => (
          <Button variant="outline" size="sm" onClick={() => edit(permission)}>
            Editar
          </Button>
        )}
      />
    </section>
  )
}

