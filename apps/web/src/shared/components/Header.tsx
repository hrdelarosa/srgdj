export default function Header() {
  return (
    <header className="sticky top-0 z-50 px-4 lg:px-10 2xl:px-0 w-full border-b backdrop-blur-md h-20 flex flex-col justify-center transition-colors duration-300 bg-white/80 dark:bg-dark-bg/80">
      <nav className="max-w-7xl mx-auto flex items-center justify-between w-full">
        <a href="/" className="flex items-center gap-1.5">
          <img src="/GOB-INM.webp" alt="SRGDJ Logo" className="h-20" />
          {/* <h1 className="hidden sm:block text-xl sm:text-2xl font-bold font-exo2">
            Apex Rivals
          </h1> */}
        </a>

        <div className="hidden lg:flex items-center gap-5">
          {/* {ROUTES_HEADER.map((route) => (
            <Link
              key={route.label}
              href={route.href}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {route.label}
            </Link>
          ))} */}
        </div>

        <div className="hidden lg:flex items-center gap-3">
          {/* <Button variant="ghost" asChild>
            <Link href="/login">Iniciar sesión</Link>
          </Button>
          <Button variant="default" asChild>
            <Link href="/register">Crear cuenta</Link>
          </Button> */}
        </div>
      </nav>
    </header>
  )
}
