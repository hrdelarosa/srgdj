import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useLocation } from 'wouter'
import type { ApiError } from '@/shared/types/errors.type'

import { deleteDocument } from '../api/document.api'

export function useDeleteDocument() {
  const queryClient = useQueryClient()
  const [, setLocation] = useLocation()

  return useMutation({
    mutationFn: deleteDocument,

    onSuccess: () => {
      toast.success('Documento eliminado correctamente')
      queryClient.invalidateQueries({ queryKey: ['documents'] })
      setLocation('/documents')
    },

    onError: (error: ApiError) => {
      toast.error(error.error.message ?? 'No se pudo eliminar el documento')
    },
  })
}
