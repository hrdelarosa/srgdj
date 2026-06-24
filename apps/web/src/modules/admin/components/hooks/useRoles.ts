import { useQuery } from '@tanstack/react-query'
import { adminApi } from '../../api/admin.api'

export function useRoles() {
  const rolesQuery = useQuery({
    queryKey: ['admin-roles'],
    queryFn: adminApi.roles,
  })

  return {
    roles: rolesQuery,
  }
}
