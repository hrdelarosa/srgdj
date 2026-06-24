import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '../api/admin.api'
import type { ApiError } from '@/shared/types/errors.type'
import type { EditUserFormInput } from '../schemas/users.schema'
import { toast } from 'sonner'

export function useUsers(id?: string) {
  const queryClient = useQueryClient()

  const usersQuery = useQuery({
    queryKey: ['admin-users'],
    queryFn: adminApi.users,
  })

  const userQuery = useQuery({
    queryKey: ['admin-user', id],
    queryFn: () => adminApi.user(id as string),
    enabled: Boolean(id),
  })

  const createUserMutation = useMutation({
    mutationFn: adminApi.createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
    },
    onError: (error: ApiError) => {
      toast.error(error.error.message ?? 'No se pudo crear el usuario')
    },
  })

  const updateUserMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: EditUserFormInput }) =>
      adminApi.updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      queryClient.invalidateQueries({ queryKey: ['admin-user', id] })
    },
    onError: (error: ApiError) => {
      toast.error(error.error.message ?? 'No se pudo actualizar el usuario')
    },
  })

  const changeUserActiveMutation = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      adminApi.setUserActive(id, active),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
    },
    onError: (error: ApiError) => {
      toast.error(
        error.error.message ?? 'No se pudo cambiar el estado del usuario',
      )
    },
  })

  return {
    usersQuery,
    user: userQuery,
    createUser: createUserMutation,
    updateUser: updateUserMutation,
    changeUserActive: changeUserActiveMutation,
  }
}
