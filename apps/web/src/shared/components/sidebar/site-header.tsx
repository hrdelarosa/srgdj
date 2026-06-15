import { Separator } from '../ui/separator'
import { SidebarTrigger } from '../ui/sidebar'
import SiteUser from './site-user'

export default function SiteHeader() {
  return (
    <header className="flex h-15 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-13">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-8"
        />
        <h1 className="text-lg font-semibold tracking-tight">
          Sistema de Control de Documentos Jurídicos
        </h1>

        <SiteUser />
      </div>
    </header>
  )
}
