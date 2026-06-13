import { useCan } from '../hooks/useCan'

interface Props {
  permission: string
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function Can({ permission, children, fallback = null }: Props) {
  const can = useCan({ permission })

  if (!can) return fallback

  return children
}
