import { Link, useRoute } from 'wouter'
import { formatDate } from '@/shared/lib/formatDate'

import Detail from '@/shared/components/Detail'
import { Can } from '@/modules/documents/components/Can'
import { Button } from '@/shared/components/ui/button'
import { Separator } from '@/shared/components/ui/separator'
import EventTimeline from '@/shared/components/EventTimeline'
import { useDocument } from '@/modules/documents/hooks/useDocument'
import {
  ArrowLeftIcon,
  CalendarIcon,
  FilePenIcon,
  FileTextIcon,
  HashIcon,
  MapPinIcon,
  PanelTopIcon,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card'

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
    <>
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="size-11 bg-primary text-primary-foreground flex shrink-0 items-center justify-center rounded-lg">
            <FileTextIcon size={20} />
          </div>

          <div>
            <p className="text-sm font-medium text-muted-foreground">
              {document.documentType.name}
            </p>
            <h1 className="text-balance text-2xl font-semibold tracking-tight text-foreground">
              {document.officeNumber}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Can permission="documents:create">
            <Link to={`/documents/${documentId}/edit`}>
              <Button size="lg">
                <FilePenIcon />
                Editar
              </Button>
            </Link>
          </Can>

          <Link href="/documents">
            <Button variant="outline" size="lg">
              <ArrowLeftIcon />
              Volver
            </Button>
          </Link>
        </div>
      </div>

      <section className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <HashIcon className="size-4 text-muted-foreground" /> Datos
              generales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
              <Detail label="Número de oficio" value={document.officeNumber} />
              <Detail
                label="Número de expediente"
                value={document.caseNumber}
              />
              <Detail
                label="Tipo de documento"
                value={document.documentType.name}
              />
              <Detail
                label="Estado actual"
                value={document.currentStatus.name}
              />
              <Detail label="Actor" value={document.actor} />
              <Detail label="Demandado" value={document.defendant} />
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CalendarIcon className="size-4 text-muted-foreground" /> Fechas y
              ubicación
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
              <Detail
                label="Fecha de oficio"
                value={formatDate({
                  value: document.officeDate,
                  withTime: true,
                  monthFormat: 'long',
                })}
              />
              <Detail
                label="Fecha de recepción"
                value={formatDate({
                  value: document.receivedDate,
                  withTime: true,
                  monthFormat: 'long',
                })}
              />
              <Detail
                label="Ubicación física"
                value={
                  document.physicalLocation && (
                    <span className="inline-flex items-center gap-1">
                      <MapPinIcon className="size-3.5 " />
                      {document.physicalLocation.name}
                    </span>
                  )
                }
              />
              <Detail
                label="Gaveta"
                value={
                  document.physicalLocation && (
                    <span className="inline-flex items-center gap-1">
                      <PanelTopIcon className="size-3.5 " />
                      {document.physicalLocation.drawer}
                    </span>
                  )
                }
              />
              <Detail
                label="Referencia"
                value={document.physicalLocation?.reference}
              />
              <Detail
                label="Registrado por"
                value={document.createdBy.fullName}
              />
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Anexos y observaciones</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 gap-y-5">
              <Detail label="Anexos" value={document.annexes} />
              <Detail label="Observaciones" value={document.observations} />
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Historial de eventos</CardTitle>
          </CardHeader>
          <CardContent>
            <EventTimeline events={document.events} />
          </CardContent>
        </Card>

        <Separator />

        <p className="text-center text-xs text-muted-foreground">
          Creado el {formatDate({ value: document.createdAt, withTime: true })}{' '}
          · Última actualización{' '}
          {formatDate({ value: document.updatedAt, withTime: true })}
        </p>
      </section>
    </>
  )
}
