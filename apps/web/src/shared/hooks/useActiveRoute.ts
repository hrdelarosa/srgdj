import { useLocation } from 'wouter'

export function useActiveRoute() {
  const [pathname] = useLocation()
  const isActive = (path: string) => pathname === path

  return { isActive }
}
