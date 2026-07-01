import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '../api/admin.api'
import type { ApiError } from '@/shared/types/errors.type'
import { toast } from 'sonner'
import type {
  CreateDocumentStatusesFormInput,
  CreateDocumentTypesFormInput,
  CreatePhysicalLocationsFormInput,
} from '../schemas/catalogs.schema'

export function useCatalogs(catalog: string, id?: string) {
  const queryClient = useQueryClient()

  const catalogQuery = useQuery({
    queryKey: ['admin-catalog', catalog],
    queryFn: () => adminApi.catalogs(catalog),
  })

  const catalogItemQuery = useQuery({
    queryKey: ['admin-catalog', catalog, id],
    queryFn: () => adminApi.catalog(catalog, id as string),
    enabled: Boolean(id),
  })

  const createCatalogMutation = useMutation({
    mutationFn: (
      data:
        | CreateDocumentTypesFormInput
        | CreateDocumentStatusesFormInput
        | CreatePhysicalLocationsFormInput,
    ) => adminApi.createCatalog(catalog, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-catalog', catalog] })
    },
    onError: (error: ApiError) => {
      toast.error(error.error.message ?? 'No se pudo crear el catálogo')
    },
  })

  const updateCatalogMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string
      data:
        | CreateDocumentTypesFormInput
        | CreateDocumentStatusesFormInput
        | CreatePhysicalLocationsFormInput
    }) => adminApi.updateCatalog(catalog, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-catalog', catalog] })
    },
    onError: (error: ApiError) => {
      toast.error(error.error.message ?? 'No se pudo actualizar el catálogo')
    },
  })

  const changeCatalogActiveMutation = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      adminApi.setCatalogActive(catalog, id, active),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-catalog', catalog] })
    },
    onError: (error: ApiError) => {
      toast.error(
        error.error.message ?? 'No se pudo actualizar el estado del catálogo',
      )
    },
  })

  return {
    catalogQuery,
    catalog: catalogItemQuery,
    createCatalog: createCatalogMutation,
    changeCatalogActive: changeCatalogActiveMutation,
    updateCatalog: updateCatalogMutation,
  }
}
