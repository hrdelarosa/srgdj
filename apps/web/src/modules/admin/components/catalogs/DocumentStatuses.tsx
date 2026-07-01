import DataTable from '../DataTable'
import StatusBadge from '../StatusBadge'
import StatusToggleButton from '../StatusToggleButton'
import EditDocumentStatusesDialog from './EditDocumentStatusesDialog'
import { useCatalogs } from '../../hooks/useCatalogs'

export default function DocumentsStatuses() {
  const { catalogQuery, changeCatalogActive } = useCatalogs('document-statuses')
  const documentsStatuses = catalogQuery.data?.items ?? []

  return (
    <DataTable
      items={documentsStatuses}
      isLoading={catalogQuery.isLoading}
      emptyMessage="No se encontraron estatus de documentos"
      getRowKey={(item) => item.id}
      columns={[
        {
          key: 'code',
          label: 'Código',
          render: (item) => item.code,
        },
        {
          key: 'name',
          label: 'Nombre',
          render: (item) => item.name,
        },
        {
          key: 'description',
          label: 'Descripción',
          render: (item) => item.description,
        },
        {
          key: 'isActive',
          label: 'Estado',
          render: (item) => <StatusBadge isActive={item.isActive} />,
          className: 'w-20',
        },
        {
          key: 'sortOrder',
          label: 'Orden',
          render: (item) => item.sortOrder,
          className: 'text-center w-18',
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
              label="estatus de documento"
            />

            <EditDocumentStatusesDialog id={item.id} />
          </div>
        ),
      }}
    />
  )
}
