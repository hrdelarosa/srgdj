import DataTable from '../DataTable'
import StatusBadge from '../StatusBadge'
import StatusToggleButton from '../StatusToggleButton'
import EditDocumentsTypesDialog from './EditDocumentsTypesDialog'
import { useCatalogs } from '../../hooks/useCatalogs'

export default function DocumentsTypes() {
  const { catalogQuery, changeCatalogActive } = useCatalogs('document-types')
  const documentsTypes = catalogQuery.data?.items ?? []

  return (
    <DataTable
      items={documentsTypes}
      isLoading={catalogQuery.isLoading}
      emptyMessage="No se encontraron tipos de documentos"
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
              label="tipo de documento"
            />

            <EditDocumentsTypesDialog id={item.id} />
          </div>
        ),
      }}
    />
  )
}
