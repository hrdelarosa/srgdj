import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '../api/admin.api'
import type { ApiError } from '@/shared/types/errors.type'
import { toast } from 'sonner'
import type { EditPermissionsFormInput } from '../schemas/permissions.schema'

export function usePermissions(id?: string) {
  const queryClient = useQueryClient()

  const permissionsQuery = useQuery({
    queryKey: ['admin-permissions'],
    queryFn: adminApi.permissions,
  })

  const permissionQuery = useQuery({
    queryKey: ['admin-permissions', id],
    queryFn: () => adminApi.permission(id as string),
    enabled: Boolean(id),
  })

  const createPermissionsMutation = useMutation({
    mutationFn: adminApi.createPermission,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-permissions'] })
    },
    onError: (error: ApiError) => {
      toast.error(error.error.message ?? 'No se pudo crear el permiso')
    },
  })

  const updatePermissionsMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string
      data: EditPermissionsFormInput
    }) => adminApi.updatePermission(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-permissions'] })
      queryClient.invalidateQueries({ queryKey: ['admin-permissions', id] })
    },
    onError: (error: ApiError) => {
      toast.error(error.error.message ?? 'No se pudo actualizar el permiso')
    },
  })

  const changePermissionsActiveMutation = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      adminApi.setPermissionsActive(id, active),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-permissions'] })
    },
    onError: (error: ApiError) => {
      toast.error(
        error.error.message ?? 'No se pudo cambiar el estado del permiso',
      )
    },
  })

  return {
    permissionsQuery,
    permission: permissionQuery,
    createPermissions: createPermissionsMutation,
    updatePermissions: updatePermissionsMutation,
    changePermissionsActive: changePermissionsActiveMutation,
  }
}
