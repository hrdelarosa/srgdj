import { useEffect, useRef, useState } from 'react'
import { updateDocumentSchema } from '@srgdj/shared'

import { getDateInputValue } from '@/shared/lib/formatDate'
import { useValidatedForm } from '@/shared/hooks/useValidatedForm'
import { useDocument } from './useDocument'
import {
  useDocumentStatuses,
  useDocumentTypes,
  usePhysicalLocations,
} from './useDocumentCatalogs'
import { useUpdateDocument } from './useUpdateDocument'

export function useEditDocumentForm(documentId: string) {
  const documentQuery = useDocument(documentId)
  const updateMutation = useUpdateDocument(documentId)
  const typesQuery = useDocumentTypes()
  const statusesQuery = useDocumentStatuses()
  const locationsQuery = usePhysicalLocations()
  const [documentTypeId, setDocumentTypeId] = useState('')
  const [currentStatusId, setCurrentStatusId] = useState('')
  const [physicalLocationId, setPhysicalLocationId] = useState('')
  const initializedDocumentId = useRef<string | null>(null)
  const document = documentQuery.data
  const documentTypeFallbackId =
    document?.documentType.id ||
    typesQuery.data?.items.find(
      (type) =>
        type.code === document?.documentType.code ||
        type.name === document?.documentType.name,
    )?.id ||
    ''
  const statusFallbackId =
    document?.currentStatus.id ||
    statusesQuery.data?.items.find(
      (status) =>
        status.code === document?.currentStatus.code ||
        status.name === document?.currentStatus.name,
    )?.id ||
    ''
  const locationFallbackId =
    document?.physicalLocation?.id ||
    locationsQuery.data?.items.find(
      (location) =>
        location.name === document?.physicalLocation?.name &&
        location.drawer === document?.physicalLocation?.drawer,
    )?.id ||
    ''
  const selectedDocumentTypeId = documentTypeId || documentTypeFallbackId
  const selectedStatusId = currentStatusId || statusFallbackId
  const selectedLocationId = physicalLocationId || locationFallbackId

  const form = useValidatedForm({
    formSchema: updateDocumentSchema,
    onSubmit: (data) =>
      updateMutation.mutate({
        ...data,
        documentTypeId: data.documentTypeId || selectedDocumentTypeId,
        currentStatusId: data.currentStatusId || selectedStatusId,
        physicalLocationId:
          data.physicalLocationId || selectedLocationId || undefined,
      }),
    defaultValues: {
      officeNumber: '',
      caseNumber: '',
      actor: '',
      defendant: '',
      documentTypeId: '',
      currentStatusId: '',
      physicalLocationId: undefined,
      officeDate: '',
      receivedDate: '',
      annexes: '',
      observations: '',
    },
  })
  const { reset, setValue } = form

  useEffect(() => {
    if (!document) return
    if (initializedDocumentId.current === document.id) return

    const nextDocumentTypeId = document.documentType.id || documentTypeFallbackId
    const nextStatusId = document.currentStatus.id || statusFallbackId
    const nextLocationId =
      document.physicalLocation?.id || locationFallbackId || ''

    setDocumentTypeId(nextDocumentTypeId)
    setCurrentStatusId(nextStatusId)
    setPhysicalLocationId(nextLocationId)

    reset({
      officeNumber: document.officeNumber,
      caseNumber: document.caseNumber ?? '',
      actor: document.actor ?? '',
      defendant: document.defendant ?? '',
      documentTypeId: nextDocumentTypeId,
      currentStatusId: nextStatusId,
      physicalLocationId: nextLocationId || undefined,
      officeDate: getDateInputValue(document.officeDate),
      receivedDate: getDateInputValue(document.receivedDate),
      annexes: document.annexes ?? '',
      observations: document.observations ?? '',
    })

    setValue('documentTypeId', nextDocumentTypeId, { shouldDirty: false })
    setValue('currentStatusId', nextStatusId, { shouldDirty: false })
    setValue('physicalLocationId', nextLocationId || undefined, {
      shouldDirty: false,
    })
    initializedDocumentId.current = document.id
  }, [
    document,
    documentTypeFallbackId,
    locationFallbackId,
    locationsQuery.data,
    reset,
    setValue,
    statusFallbackId,
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

  function handleLocationChange(value: string) {
    setPhysicalLocationId(value)
    setValue('physicalLocationId', value, {
      shouldDirty: true,
      shouldValidate: true,
    })
  }

  return {
    document,
    documentQuery,
    updateMutation,
    typesQuery,
    statusesQuery,
    locationsQuery,
    documentTypeId: selectedDocumentTypeId,
    currentStatusId: selectedStatusId,
    physicalLocationId: selectedLocationId,
    handleDocumentTypeChange,
    handleStatusChange,
    handleLocationChange,
    ...form,
  }
}
