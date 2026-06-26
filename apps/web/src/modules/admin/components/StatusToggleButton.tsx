import { ToggleLeftIcon, ToggleRightIcon } from 'lucide-react'

import { Button } from '@/shared/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/shared/components/ui/tooltip'

interface Props {
  isActive: boolean
  onToggle: () => void
  label: string
}

export default function StatusToggleButton({
  isActive,
  onToggle,
  label,
}: Props) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className={`cursor-pointer transition-colors group ${
            isActive
              ? 'hover:bg-red-50 hover:text-red-600 hover:border-red-200'
              : 'hover:bg-green-50 hover:text-green-600 hover:border-green-200'
          }`}
          onClick={onToggle}
        >
          {isActive ? (
            <ToggleRightIcon className="text-green-600 group-hover:text-red-500" />
          ) : (
            <ToggleLeftIcon className="text-gray-400/80 group-hover:text-green-500" />
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="left">
        <p>{isActive ? `Desactivar ${label}` : `Activar ${label}`}</p>
      </TooltipContent>
    </Tooltip>
  )
}
