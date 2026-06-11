export function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-md flex-col gap-3">
        <h1>Sistema de Control de Documentos Jurídicos</h1>

        {children}
      </div>
    </div>
  )
}
