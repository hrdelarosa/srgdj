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

interface Props {
  documentId: string
}

export function DocumentActions({ documentId }: Props) {
  const [, setLocation] = useLocation()

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
          <DropdownMenuItem
            onClick={() => setLocation(`/documents/${documentId}`)}
          >
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
