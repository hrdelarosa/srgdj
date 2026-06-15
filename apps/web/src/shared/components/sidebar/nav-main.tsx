import { useActiveRoute } from '@/shared/hooks/useActiveRoute'
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '../ui/sidebar'
import { SIDEBAR_MAIN_ROUTES } from '@/config/routes'
import { Link } from 'wouter'
import { Can } from '@/modules/documents/components/Can'

export default function NavMain() {
  const { isActive } = useActiveRoute()

  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu className="space-y-1">
          {SIDEBAR_MAIN_ROUTES.map((route) => (
            <Can key={route.href} permission={route.permission}>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive(route.href)}
                  tooltip={route.label}
                  className="hover:bg-sidebar-hover hover:text-sidebar-foreground data-active:bg-white data-active:hover:bg-sidebar-accent data-active:hover:text-black"
                >
                  <Link href={route.href}>
                    {route.icon && <route.icon />}
                    <span>{route.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </Can>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
