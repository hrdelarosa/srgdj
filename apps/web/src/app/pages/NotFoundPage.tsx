import { Link } from 'wouter'

export function NotFoundPage() {
  return (
    <section>
      <h1>404</h1>
      <p>Página no encontrada</p>
      <Link href="/home">Volver al inicio</Link>
    </section>
  )
}
