import type { ComponentProps } from 'react'
import { LogOut } from 'lucide-react'
import { Link } from 'wouter'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '../ui/sidebar'
import NavMain from './nav-main'
import { Button } from '../ui/button'
import { useLogout } from '@/modules/auth/hooks/useLogout'

export default function AppSidebar({
  ...props
}: ComponentProps<typeof Sidebar>) {
  const logoutMutation = useLogout()

  return (
    <Sidebar collapsible="offcanvas" {...props} className="">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <Link
              href="/home"
              className="flex items-center justify-center hover:bg-sidebar-accent rounded-md bg-background"
            >
              <img
                src="/inm-a.webp"
                alt="Logo del Instituto Nacional de Migración"
                className="h-24"
              />
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain />
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Button
                variant="ghost"
                className="cursor-pointer justify-start"
                onClick={() => logoutMutation.mutate()}
                disabled={logoutMutation.isPending}
              >
                <LogOut />
                Cerrar sesión
              </Button>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
