import { Link, useRoute } from 'wouter'

import { Button } from '@/shared/components/ui/button'
import { formatDate } from '@/shared/lib/formatDate'
import { useDocument } from '@/modules/documents/hooks/useDocument'

export function DocumentDetailPage() {
  const [, params] = useRoute('/documents/:id')
  const documentId = params?.id ?? ''

  const documentQuery = useDocument(documentId)

  if (documentQuery.isLoading) {
    return <p className="p-6">Cargando documento...</p>
  }

  if (documentQuery.isError || !documentQuery.data) {
    return <p className="p-6">No se pudo cargar el documento</p>
  }

  const document = documentQuery.data

  return (
    <section className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{document.officeNumber}</h1>
          <p className="text-muted-foreground">
            Detalle completo del documento
          </p>
        </div>

        <Link href="/documents">
          <Button variant="outline">Volver</Button>
        </Link>
      </div>

      <div className="grid gap-4 rounded-md border p-4 md:grid-cols-2">
        <Detail label="No. oficio" value={document.officeNumber} />
        <Detail label="No. expediente" value={document.caseNumber} />
        <Detail label="Actor" value={document.actor} />
        <Detail label="Demandado" value={document.defendant} />
        <Detail label="Tipo" value={document.documentType.name} />
        <Detail label="Estatus" value={document.currentStatus.name} />
        <Detail
          label="Fecha de oficio"
          value={formatDate(document.officeDate)}
        />
        <Detail
          label="Fecha de recibido"
          value={formatDate(document.receivedDate)}
        />
        <Detail
          label="Ubicación física"
          value={document.physicalLocation?.name}
        />
        <Detail label="Gaveta" value={document.physicalLocation?.drawer} />
      </div>

      <div className="rounded-md border p-4">
        <h2 className="mb-2 text-lg font-semibold">Anexos</h2>
        <p>{document.annexes ?? 'Sin anexos'}</p>
      </div>

      <div className="rounded-md border p-4">
        <h2 className="mb-2 text-lg font-semibold">Observaciones</h2>
        <p>{document.observations ?? 'Sin observaciones'}</p>
      </div>

      <div className="rounded-md border p-4">
        <h2 className="mb-4 text-lg font-semibold">Bitácora</h2>

        {document.events.length === 0 ? (
          <p className="text-muted-foreground">Sin eventos registrados</p>
        ) : (
          <div className="space-y-3">
            {document.events.map((event) => (
              <div key={event.id} className="rounded-md border p-3">
                <div className="flex justify-between gap-4">
                  <strong>{event.eventType}</strong>
                  <span className="text-muted-foreground text-sm">
                    {formatDate(event.createdAt)}
                  </span>
                </div>

                {event.note && <p className="mt-2">{event.note}</p>}

                {(event.fromStatus?.name || event.toStatus?.name) && (
                  <p className="text-muted-foreground mt-2 text-sm">
                    {event.fromStatus?.name ?? 'Sin estado'} →{' '}
                    {event.toStatus?.name ?? 'Sin estado'}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

function Detail({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="text-muted-foreground text-sm">{label}</p>
      <p className="font-medium">{value || '-'}</p>
    </div>
  )
}
