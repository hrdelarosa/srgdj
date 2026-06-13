import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { adminApi, type CatalogItem } from '@/modules/admin/api/admin.api'
import { AdminTable, StatusBadge } from '@/modules/admin/components/AdminTable'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'

const catalogs = [
  { endpoint: 'document-types', label: 'Tipos de documento' },
  { endpoint: 'document-statuses', label: 'Estatus' },
  { endpoint: 'physical-locations', label: 'Ubicaciones físicas' },
]

export function AdminCatalogsPage() {
  const queryClient = useQueryClient()
  const [endpoint, setEndpoint] = useState(catalogs[0].endpoint)
  const [editing, setEditing] = useState<CatalogItem | null>(null)
  const [form, setForm] = useState({
    code: '',
    name: '',
    description: '',
    drawer: '',
    reference: '',
    sortOrder: '1',
    isTerminal: false,
  })

  const catalogQuery = useQuery({
    queryKey: ['admin-catalog', endpoint],
    queryFn: () => adminApi.catalogs(endpoint),
  })

  const saveMutation = useMutation({
    mutationFn: () => {
      const data =
        endpoint === 'physical-locations'
          ? {
              name: form.name,
              drawer: form.drawer || null,
              reference: form.reference || null,
            }
          : endpoint === 'document-statuses'
            ? {
                code: form.code,
                name: form.name,
                description: form.description || null,
                sortOrder: Number(form.sortOrder),
                isTerminal: form.isTerminal,
              }
            : {
                code: form.code,
                name: form.name,
                description: form.description || null,
              }

      return editing
        ? adminApi.updateCatalog(endpoint, editing.id, data)
        : adminApi.createCatalog(endpoint, data)
    },
    onSuccess: () => {
      setEditing(null)
      resetForm()
      queryClient.invalidateQueries({ queryKey: ['admin-catalog', endpoint] })
    },
  })

  const activeMutation = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      adminApi.setCatalogActive(endpoint, id, active),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['admin-catalog', endpoint] }),
  })

  function resetForm() {
    setForm({
      code: '',
      name: '',
      description: '',
      drawer: '',
      reference: '',
      sortOrder: '1',
      isTerminal: false,
    })
  }

  function edit(item: CatalogItem) {
    setEditing(item)
    setForm({
      code: item.code ?? '',
      name: item.name,
      description: item.description ?? '',
      drawer: item.drawer ?? '',
      reference: item.reference ?? '',
      sortOrder: String(item.sortOrder ?? 1),
      isTerminal: Boolean(item.isTerminal),
    })
  }

  return (
    <section className="space-y-5 p-6">
      <header>
        <h1 className="text-2xl font-bold">Catálogos</h1>
        <p className="text-muted-foreground">
          Tipos, estatus y ubicaciones físicas del archivo.
        </p>
      </header>

      <div className="flex flex-wrap gap-2">
        {catalogs.map((catalog) => (
          <Button
            key={catalog.endpoint}
            variant={endpoint === catalog.endpoint ? 'default' : 'outline'}
            onClick={() => {
              setEndpoint(catalog.endpoint)
              setEditing(null)
              resetForm()
            }}
          >
            {catalog.label}
          </Button>
        ))}
      </div>

      <form
        className="grid gap-3 rounded-md border p-4 md:grid-cols-4"
        onSubmit={(event) => {
          event.preventDefault()
          saveMutation.mutate()
        }}
      >
        {endpoint !== 'physical-locations' && (
          <Input
            placeholder="Código"
            value={form.code}
            onChange={(event) => setForm({ ...form, code: event.target.value })}
          />
        )}
        <Input
          placeholder="Nombre"
          value={form.name}
          onChange={(event) => setForm({ ...form, name: event.target.value })}
        />
        {endpoint === 'physical-locations' ? (
          <>
            <Input
              placeholder="Gaveta"
              value={form.drawer}
              onChange={(event) =>
                setForm({ ...form, drawer: event.target.value })
              }
            />
            <Input
              placeholder="Referencia"
              value={form.reference}
              onChange={(event) =>
                setForm({ ...form, reference: event.target.value })
              }
            />
          </>
        ) : (
          <Input
            placeholder="Descripción"
            value={form.description}
            onChange={(event) =>
              setForm({ ...form, description: event.target.value })
            }
          />
        )}
        {endpoint === 'document-statuses' && (
          <Input
            placeholder="Orden"
            type="number"
            value={form.sortOrder}
            onChange={(event) =>
              setForm({ ...form, sortOrder: event.target.value })
            }
          />
        )}
        <Button type="submit">{editing ? 'Guardar' : 'Crear'}</Button>
      </form>

      <AdminTable
        items={catalogQuery.data?.items ?? []}
        columns={[
          { key: 'code', label: 'Código', render: (item) => item.code ?? '-' },
          { key: 'name', label: 'Nombre', render: (item) => item.name },
          {
            key: 'status',
            label: 'Estado',
            render: (item) => <StatusBadge active={item.isActive} />,
          },
        ]}
        actions={(item) => (
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => edit(item)}>
              Editar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                activeMutation.mutate({ id: item.id, active: !item.isActive })
              }
            >
              {item.isActive ? 'Desactivar' : 'Activar'}
            </Button>
          </div>
        )}
      />
    </section>
  )
}

