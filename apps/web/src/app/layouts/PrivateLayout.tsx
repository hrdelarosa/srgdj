import type { ReactNode } from 'react'
import { Link } from 'wouter'

import { useLogout } from '@/modules/auth/hooks/useLogout'
import { useAuthStore } from '@/modules/auth/store/auth.store'
import { Can } from '@/modules/documents/components/Can'
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

          <Link href="/documents">
            <Button variant="link">Documentos</Button>
          </Link>

          <Can permission="users:read">
            <Link href="/admin/users">
              <Button variant="link">Usuarios</Button>
            </Link>
          </Can>

          <Can permission="roles:read">
            <Link href="/admin/roles">
              <Button variant="link">Roles</Button>
            </Link>
          </Can>

          <Can permission="permissions:read">
            <Link href="/admin/permissions">
              <Button variant="link">Permisos</Button>
            </Link>
          </Can>

          <Can permission="catalogs:read">
            <Link href="/admin/catalogs">
              <Button variant="link">Catálogos</Button>
            </Link>
          </Can>

          <Can permission="audit:read">
            <Link href="/admin/audit">
              <Button variant="link">Auditoría</Button>
            </Link>
          </Can>
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
