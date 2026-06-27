import { Badge } from '@/shared/components/ui/badge'

export default function StatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <Badge
      className={
        isActive
          ? 'bg-emerald-100 text-emerald-700'
          : 'bg-zinc-100 text-zinc-600'
      }
    >
      {isActive ? 'Activo' : 'Inactivo'}
    </Badge>
  )
}
