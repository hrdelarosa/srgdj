import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useLocation } from 'wouter'

import { createDocument } from '../api/document.api'
import type { ApiError } from '@/shared/types/errors.type'

export function useCreateDocument() {
  const queryClient = useQueryClient()
  const [, setLocation] = useLocation()

  return useMutation({
    mutationFn: createDocument,

    onSuccess: (document) => {
      toast.success('Documento registrado correctamente')
      queryClient.invalidateQueries({ queryKey: ['documents'] })
      setLocation(`/documents/${document.id}`)
    },

    onError: (error: ApiError) => {
      toast.error(error.error.message ?? 'No se pudo registrar el documento')
    },
  })
}
