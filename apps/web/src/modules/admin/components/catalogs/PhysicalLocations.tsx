import DataTable from '../DataTable'
import StatusBadge from '../StatusBadge'
import StatusToggleButton from '../StatusToggleButton'
import EditPhysicalLocationsDialog from './EditPhysicalLocationsDialog'
import { useCatalogs } from '../../hooks/useCatalogs'

export default function PhysicalLocations() {
  const { catalogQuery, changeCatalogActive } =
    useCatalogs('physical-locations')
  const physicalLocations = catalogQuery.data?.items ?? []

  return (
    <DataTable
      items={physicalLocations}
      isLoading={catalogQuery.isLoading}
      emptyMessage="No se encontraron ubicaciones físicas"
      getRowKey={(item) => item.id}
      columns={[
        {
          key: 'name',
          label: 'Nombre',
          render: (item) => item.name,
        },
        {
          key: 'drawer',
          label: 'Gaveta',
          render: (item) => item.drawer,
        },
        {
          key: 'reference',
          label: 'Referencia',
          render: (item) => item.reference,
        },
        {
          key: 'isActive',
          label: 'Estado',
          render: (item) => <StatusBadge isActive={item.isActive} />,
          className: 'w-20',
        },
      ]}
      actions={{
        className: 'w-29',
        render: (item) => (
          <div className="flex items-center justify-end gap-2">
            <StatusToggleButton
              isActive={item.isActive}
              onToggle={() =>
                changeCatalogActive.mutate({
                  id: item.id,
                  active: !item.isActive,
                })
              }
              label="ubicación física"
            />

            <EditPhysicalLocationsDialog id={item.id} />
          </div>
        ),
      }}
    />
  )
}
