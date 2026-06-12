import { Eye, MoreHorizontal, PencilLine, Trash } from 'lucide-react'

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

type DocumentActionsProps = {
  documentId: string
}

export function DocumentActions({ documentId }: DocumentActionsProps) {
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
          <DropdownMenuItem onClick={() => console.log('details', documentId)}>
            <Eye />
            Detalles
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => console.log('edit', documentId)}>
            <PencilLine />
            Editar
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem
            variant="destructive"
            onClick={() => console.log('delete', documentId)}
          >
            <Trash />
            Eliminar
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
