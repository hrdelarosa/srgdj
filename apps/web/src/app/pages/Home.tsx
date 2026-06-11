import { useAuthStore } from '@/modules/auth/store/auth.store'

export function DashboardPage() {
  const { user } = useAuthStore()

  return (
    <section>
      <h1>Dashboard</h1>
      <p>Bienvenido, {user?.fullName}</p>
      <p>Rol: {user?.role.name}</p>
    </section>
  )
}
