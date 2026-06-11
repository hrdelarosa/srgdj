import { Separator } from './ui/separator'

export default function PublicHeader() {
  return (
    <header className="absolute h-28 top-0 z-50 px-4 lg:px-10 2xl:px-0 w-full p-3 flex flex-col justify-center">
      <div className="max-w-7xl mx-auto flex items-center justify-between w-full">
        <div className="flex items-center gap-3">
          <img src="/segob.webp" alt="SEGOB Logo" className="h-16 pr-2" />

          <Separator orientation="vertical" className="my-2.5" />

          <img src="/inm.webp" alt="INM Logo" className="h-22" />
        </div>

        <div className="flex flex-col items-end">
          <h1 className="hidden sm:block text-xl sm:text-2xl font-bold font-exo2">
            Oficina de Representación del INM Guerrero
          </h1>

          <p className="text-sm sm:text-lg text-muted-foreground">
            Sistema de Control de Documentos Jurídicos
          </p>
        </div>
      </div>
    </header>
  )
}
