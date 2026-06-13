import { Eye, MoreHorizontal, PencilLine, Trash } from 'lucide-react'

import { useLocation } from 'wouter'
import { Button } from '@/shared/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu'
import { useDeleteDocument } from '../hooks/useDeleteDocument'
import { Can } from './Can'

interface Props {
  documentId: string
}

export function DocumentActions({ documentId }: Props) {
  const [, setLocation] = useLocation()
  const deleteMutation = useDeleteDocument()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm">
          <span className="sr-only">Abrir menú</span>
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Acciones</DropdownMenuLabel>

        <DropdownMenuGroup>
          <Can permission="documents:read">
            <DropdownMenuItem
              onClick={() => setLocation(`/documents/${documentId}`)}
            >
              <Eye />
              Detalles
            </DropdownMenuItem>
          </Can>

          <Can permission="documents:update">
            <DropdownMenuItem
              onClick={() => setLocation(`/documents/${documentId}/edit`)}
            >
              <PencilLine />
              Editar
            </DropdownMenuItem>
          </Can>
        </DropdownMenuGroup>

        <Can permission="documents:delete">
          <DropdownMenuSeparator />

          <DropdownMenuGroup>
            <DropdownMenuItem
              variant="destructive"
              disabled={deleteMutation.isPending}
              onClick={() => {
                const confirmed = window.confirm(
                  '¿Seguro que deseas eliminar este documento? Esta acción lo ocultará del listado, pero no lo borrará definitivamente.',
                )

                if (!confirmed) return

                deleteMutation.mutate({ id: documentId })
              }}
            >
              <Trash />
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </Can>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
