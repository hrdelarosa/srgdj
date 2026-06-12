import type { ReactNode } from 'react'
import { Link } from 'wouter'

import { useLogout } from '@/modules/auth/hooks/useLogout'
import { useAuthStore } from '@/modules/auth/store/auth.store'
import { Button } from '@/shared/components/ui/button'

type PrivateLayoutProps = {
  children: ReactNode
}

export function PrivateLayout({ children }: PrivateLayoutProps) {
  const user = useAuthStore((state) => state.user)
  const logoutMutation = useLogout()

  return (
    <div>
      <aside>
        <h2>SRGDJ</h2>

        <nav>
          <Link href="/home">
            <Button variant="link">Home</Button>
          </Link>
        </nav>
      </aside>

      <main>
        <header>
          <span>{user?.fullName}</span>

          <Button
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
          >
            Cerrar sesión
          </Button>
        </header>

        {children}
      </main>
    </div>
  )
}
