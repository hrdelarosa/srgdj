import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '../api/admin.api'
import type { ApiError } from '@/shared/types/errors.type'
import { toast } from 'sonner'
import type { EditRoleFormInput } from '../schemas/roles.shcema'

export function useRoles(id?: string) {
  const queryClient = useQueryClient()

  const rolesQuery = useQuery({
    queryKey: ['admin-roles'],
    queryFn: adminApi.roles,
  })

  const roleQuery = useQuery({
    queryKey: ['admin-role', id],
    queryFn: () => adminApi.role(id as string),
    enabled: Boolean(id),
  })

  const createRoleMutation = useMutation({
    mutationFn: adminApi.createRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-roles'] })
    },
    onError: (error: ApiError) => {
      toast.error(error.error.message ?? 'No se pudo crear el rol')
    },
  })

  const updateRoleMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: EditRoleFormInput }) =>
      adminApi.updateRole(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-roles'] })
      queryClient.invalidateQueries({ queryKey: ['admin-roles', id] })
    },
    onError: (error: ApiError) => {
      toast.error(error.error.message ?? 'No se pudo actualizar el rol')
    },
  })

  const changeRoleActiveMutation = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      adminApi.setRoleActive(id, active),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-roles'] })
    },
    onError: (error: ApiError) => {
      toast.error(error.error.message ?? 'No se pudo cambiar el estado del rol')
    },
  })

  const rolePermissionsQuery = useQuery({
    queryKey: ['role-permissions', id],
    queryFn: () => adminApi.rolePermissions(id as string),
    enabled: Boolean(id),
  })

  return {
    rolesQuery,
    role: roleQuery,
    createRole: createRoleMutation,
    updateRole: updateRoleMutation,
    changeRoleActive: changeRoleActiveMutation,
    rolePermissionsQuery,
  }
}
