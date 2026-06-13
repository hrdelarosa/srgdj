import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { CreateDocumentEventInput } from '../types/document.types'
import { createDocumentEvent } from '../api/document.api'
import type { ApiError } from '@/shared/types/errors.type'

export function useCreateDocumentEvent(documentId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ data }: { data: CreateDocumentEventInput }) =>
      createDocumentEvent({ documentId, data }),

    onSuccess: () => {
      toast.success('Evento registrado correctamente')

      queryClient.invalidateQueries({ queryKey: ['documents', documentId] })
      queryClient.invalidateQueries({ queryKey: ['documents'] })
    },

    onError: (error: ApiError) => {
      toast.error(error.error.message ?? 'No se pudo registrar el evento')
    },
  })
}
