import { useState } from 'react'

import { Button } from '@/shared/components/ui/button'
import { Field, FieldLabel } from '@/shared/components/ui/field'
import { Input } from '@/shared/components/ui/input'

import { useCreateDocumentEvent } from '../hooks/useCreateDocumentEvent'
import {
  useDocumentStatuses,
} from '../hooks/useDocumentCatalogs'

type AddDocumentEventFormProps = {
  documentId: string
  currentStatusId?: string
}

export function AddDocumentEventForm({
  documentId,
  currentStatusId,
}: AddDocumentEventFormProps) {
  const [note, setNote] = useState('')
  const [eventType, setEventType] = useState<'NOTE_ADDED' | 'STATUS_CHANGED'>(
    'NOTE_ADDED',
  )
  const [toStatusId, setToStatusId] = useState('')
  const statusesQuery = useDocumentStatuses()
  const createEventMutation = useCreateDocumentEvent(documentId)

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!note.trim() && eventType === 'NOTE_ADDED') return
    if (eventType === 'STATUS_CHANGED' && !toStatusId) return

    createEventMutation.mutate(
      {
        data: {
          eventType,
          note: note.trim() || undefined,
          toStatusId: eventType === 'STATUS_CHANGED' ? toStatusId : undefined,
        },
      },
      {
        onSuccess: () => {
          setNote('')
          setToStatusId('')
          setEventType('NOTE_ADDED')
        },
      },
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-md border p-4">
      <Field>
        <FieldLabel>Tipo de seguimiento</FieldLabel>
        <select
          className="border-input bg-background h-8 rounded-md border px-2 text-sm"
          value={eventType}
          onChange={(event) =>
            setEventType(event.target.value as 'NOTE_ADDED' | 'STATUS_CHANGED')
          }
        >
          <option value="NOTE_ADDED">Nota</option>
          <option value="STATUS_CHANGED">Cambio de estado</option>
        </select>
      </Field>

      {eventType === 'STATUS_CHANGED' && (
        <Field>
          <FieldLabel>Nuevo estado</FieldLabel>
          <select
            className="border-input bg-background h-8 rounded-md border px-2 text-sm"
            value={toStatusId}
            onChange={(event) => setToStatusId(event.target.value)}
          >
            <option value="">Selecciona un estado</option>
            {statusesQuery.data?.items
              .filter((status) => status.id !== currentStatusId)
              .map((status) => (
                <option key={status.id} value={status.id}>
                  {status.name}
                </option>
              ))}
          </select>
        </Field>
      )}

      <Field>
        <FieldLabel>Nota de seguimiento</FieldLabel>
        <Input
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="Escribe una nota..."
        />
      </Field>

      <Button type="submit" disabled={createEventMutation.isPending}>
        {createEventMutation.isPending ? 'Guardando...' : 'Registrar evento'}
      </Button>
    </form>
  )
}
