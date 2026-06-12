import type { UpdateDocumentInput } from '@srgdj/shared'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useLocation } from 'wouter'

import { updateDocument } from '../api/document.api'
import type { ApiError } from '@/shared/types/errors.type'

export function useUpdateDocument(id: string) {
  const queryClient = useQueryClient()
  const [, setLocation] = useLocation()

  return useMutation({
    mutationFn: async (data: UpdateDocumentInput) => {
      return updateDocument({ id, data })
    },

    onSuccess: (document) => {
      toast.success('Documento actualizado correctamente')

      queryClient.invalidateQueries({ queryKey: ['documents'] })
      queryClient.invalidateQueries({ queryKey: ['documents', id] })

      setLocation(`/documents/${document.id}`)
    },

    onError: (error: ApiError) => {
      toast.error(error.error.message ?? 'No se pudo actualizar el documento')
    },
  })
}
