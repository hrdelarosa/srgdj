import { useQuery } from '@tanstack/react-query'
import { adminApi } from '../api/admin.api'

export function useAudit() {
  const auditQuery = useQuery({
    queryKey: ['admin-audit'],
    queryFn: adminApi.auditLogs,
  })

  return {
    auditQuery,
  }
}
