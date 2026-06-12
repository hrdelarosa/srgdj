import { useAuthStore } from '@/modules/auth/store/auth.store'

export function HomePage() {
  const { user } = useAuthStore()

  return (
    <section>
      <h1>Home</h1>
      <p>Bienvenido, {user?.fullName}</p>
      <p>Rol: {user?.role.name}</p>
    </section>
  )
}
