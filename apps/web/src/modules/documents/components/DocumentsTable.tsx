import type { DocumentListItem } from '@srgdj/shared'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table'
import { formatDate } from '@/shared/lib/formatDate'

import { DocumentActions } from './DocumentActions'

type DocumentsTableProps = {
  documents: DocumentListItem[]
}

export function DocumentsTable({ documents }: DocumentsTableProps) {
  return (
    <div className="overflow-hidden rounded-md border">
      <Table>
        <TableHeader className="bg-gray-100">
          <TableRow>
            <TableHead>No. Oficio</TableHead>
            <TableHead>Expediente</TableHead>
            <TableHead>Actor</TableHead>
            <TableHead>Demandado</TableHead>
            <TableHead>Fecha del oficio</TableHead>
            <TableHead>Fecha de recibido</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Estatus</TableHead>
            <TableHead className="w-8 text-right" />
          </TableRow>
        </TableHeader>

        <TableBody>
          {documents.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={9}
                className="text-muted-foreground text-center"
              >
                No se encontraron documentos
              </TableCell>
            </TableRow>
          ) : (
            documents.map((document) => (
              <TableRow key={document.id}>
                <TableCell className="font-medium">
                  {document.officeNumber}
                </TableCell>

                <TableCell>{document.caseNumber ?? '-'}</TableCell>
                <TableCell>{document.actor ?? '-'}</TableCell>
                <TableCell>{document.defendant ?? '-'}</TableCell>
                <TableCell>{formatDate(document.officeDate)}</TableCell>
                <TableCell>{formatDate(document.receivedDate)}</TableCell>
                <TableCell>{document.documentType.name}</TableCell>
                <TableCell>{document.currentStatus.name}</TableCell>

                <TableCell className="text-right">
                  <DocumentActions documentId={document.id} />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
