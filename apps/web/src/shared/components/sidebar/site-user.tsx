import { EllipsisVerticalIcon, LogOutIcon, UserIcon } from 'lucide-react'

import { Button } from '../ui/button'
import { Avatar, AvatarFallback } from '../ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import { useAuthStore } from '@/modules/auth/store/auth.store'
import { useLogout } from '@/modules/auth/hooks/useLogout'

export default function SiteUser() {
  const { user } = useAuthStore()
  const logoutMutation = useLogout()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="lg"
          className="ml-auto data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground cursor-pointer h-11 hover:bg-sidebar-accent"
        >
          <Avatar>
            <AvatarFallback className="bg-muted text-muted-foreground">
              {user?.username.split(' ')[0].charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-medium">{user?.username}</span>
          </div>

          <EllipsisVerticalIcon className="ml-1.5 size-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
        side="bottom"
        align="end"
        sideOffset={4}
      >
        <DropdownMenuLabel className="p-0 font-normal group">
          <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
            <Avatar className="size-8 rounded-lg grayscale group-hover:grayscale-0 transition">
              <AvatarFallback>
                {user?.username.split(' ')[0].charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">{user?.username}</span>
              <span className="truncate text-xs text-muted-foreground">
                {user?.fullName}
              </span>
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem className="hover:bg-sidebar-accent focus:bg-sidebar-accent">
            <UserIcon />
            Perfil
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          variant="destructive"
          onClick={() => logoutMutation.mutate()}
          disabled={logoutMutation.isPending}
        >
          <LogOutIcon />
          Cerrar sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
