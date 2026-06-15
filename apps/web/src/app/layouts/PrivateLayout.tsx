import { SidebarInset, SidebarProvider } from '@/shared/components/ui/sidebar'
import AppSidebar from '@/shared/components/sidebar/app-sidebar'
import SiteHeader from '@/shared/components/sidebar/site-header'

export function PrivateLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar variant="sidebar" />
      <SidebarInset>
        <SiteHeader />
        <main className="flex flex-1 flex-col gap-4 md:gap-6 p-4 md:p-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
