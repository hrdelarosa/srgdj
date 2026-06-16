import { useEffect, useState, type PropsWithChildren } from 'react'

import { useAuthStore } from '@/modules/auth/store/auth.store'
import { refreshSession } from '@/shared/api/api-client'

export function AuthBootstrap({ children }: PropsWithChildren) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const accessToken = useAuthStore((state) => state.accessToken)
  const clearSession = useAuthStore((state) => state.clearSession)
  const [isReady, setIsReady] = useState(
    !isAuthenticated || Boolean(accessToken),
  )

  useEffect(() => {
    let isMounted = true

    async function restoreSession() {
      if (!isAuthenticated || accessToken) {
        setIsReady(true)
        return
      }

      setIsReady(false)
      const refreshed = await refreshSession()

      if (!isMounted) return

      if (!refreshed) clearSession()
      setIsReady(true)
    }

    restoreSession()

    return () => {
      isMounted = false
    }
  }, [accessToken, clearSession, isAuthenticated])

  if (!isReady) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        Restaurando sesión...
      </div>
    )
  }

  return children
}
