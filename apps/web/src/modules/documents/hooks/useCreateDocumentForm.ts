import { useEffect, useState } from 'react'
import { createDocumentSchema } from '@srgdj/shared'

import { getDateInputValue } from '@/shared/lib/formatDate'
import { useValidatedForm } from '@/shared/hooks/useValidatedForm'
import { useCreateDocument } from './useCreateDocument'
import { useDocumentStatuses, useDocumentTypes } from './useDocumentCatalogs'

export function useCreateDocumentForm() {
  const createMutation = useCreateDocument()
  const typesQuery = useDocumentTypes()
  const statusesQuery = useDocumentStatuses()
  const [documentTypeId, setDocumentTypeId] = useState('')
  const [currentStatusId, setCurrentStatusId] = useState('')

  const form = useValidatedForm({
    formSchema: createDocumentSchema,
    onSubmit: (data) => createMutation.mutate({ data }),
    defaultValues: {
      officeNumber: '',
      caseNumber: '',
      actor: '',
      defendant: '',
      documentTypeId: '',
      officeDate: '',
      annexes: '',
      physicalLocationId: undefined,
      currentStatusId: '',
      receivedDate: getDateInputValue(new Date()),
      observations: '',
    },
  })
  const { setValue } = form

  useEffect(() => {
    const defaultTypeId = typesQuery.data?.items[0]?.id
    const defaultStatusId =
      statusesQuery.data?.items.find((status) => status.code === 'RECIBIDO')
        ?.id ?? statusesQuery.data?.items[0]?.id

    if (defaultTypeId && !documentTypeId) {
      setDocumentTypeId(defaultTypeId)
      setValue('documentTypeId', defaultTypeId, {
        shouldValidate: true,
      })
    }

    if (defaultStatusId && !currentStatusId) {
      setCurrentStatusId(defaultStatusId)
      setValue('currentStatusId', defaultStatusId, {
        shouldValidate: true,
      })
    }
  }, [
    currentStatusId,
    documentTypeId,
    setValue,
    statusesQuery.data,
    typesQuery.data,
  ])

  function handleDocumentTypeChange(value: string) {
    setDocumentTypeId(value)
    setValue('documentTypeId', value, {
      shouldDirty: true,
      shouldValidate: true,
    })
  }

  function handleStatusChange(value: string) {
    setCurrentStatusId(value)
    setValue('currentStatusId', value, {
      shouldDirty: true,
      shouldValidate: true,
    })
  }

  return {
    createMutation,
    typesQuery,
    statusesQuery,
    documentTypeId,
    currentStatusId,
    handleDocumentTypeChange,
    handleStatusChange,
    ...form,
  }
}
