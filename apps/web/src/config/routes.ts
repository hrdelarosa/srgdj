import {
  BookOpenTextIcon,
  FilesIcon,
  HomeIcon,
  ShieldUserIcon,
  UserKeyIcon,
  Users,
  UserSearchIcon,
} from 'lucide-react'

export const SIDEBAR_MAIN_ROUTES = [
  { label: 'Home', href: '/home', icon: HomeIcon },
  { label: 'Documentos', href: '/documents', icon: FilesIcon },
  {
    label: 'Catálogos',
    href: '/admin/catalogs',
    permission: 'catalogs:read',
    icon: BookOpenTextIcon,
  },
  {
    label: 'Usuarios',
    href: '/admin/users',
    permission: 'users:read',
    icon: Users,
  },
  {
    label: 'Roles',
    href: '/admin/roles',
    permission: 'roles:read',
    icon: UserKeyIcon,
  },
  {
    label: 'Permisos',
    href: '/admin/permissions',
    permission: 'permissions:read',
    icon: ShieldUserIcon,
  },
  {
    label: 'Auditoría',
    href: '/admin/audit',
    permission: 'audit:read',
    icon: UserSearchIcon,
  },
]
