import { apiClient } from '@/shared/api/api-client'

export type Role = {
  id: string
  code: string
  name: string
  description: string | null
  isActive: boolean
}

export type Permission = {
  id: string
  code: string
  name: string
  description: string | null
  isSystem: boolean
  isActive: boolean
}

export type AdminUser = {
  id: string
  username: string
  fullName: string
  isActive: boolean
  mustChangePassword: boolean
  role: Role
}

export type CatalogItem = {
  id: string
  code?: string
  name: string
  description?: string | null
  drawer?: string | null
  reference?: string | null
  sortOrder?: number
  isTerminal?: boolean
  isActive: boolean
}

export type AuditLog = {
  id: string
  action: string
  entityType: string
  entityId: string | null
  createdAt: string
  actor: {
    id: string | null
    username: string | null
    fullName: string | null
  }
}

type Items<T> = { items: T[] }

export const adminApi = {
  users: () => apiClient<Items<AdminUser>>('/users'),
  user: (id: string) => apiClient<AdminUser>(`/users/${id}`),
  createUser: (data: {
    username: string
    password: string
    fullName: string
    roleId: string
    isActive?: boolean
  }) =>
    apiClient<AdminUser>('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateUser: (id: string, data: Partial<AdminUser> & { roleId?: string }) =>
    apiClient<AdminUser>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  setUserActive: (id: string, active: boolean) =>
    apiClient<AdminUser>(
      `/users/${id}/${active ? 'activate' : 'desactivate'}`,
      {
        method: 'PATCH',
      },
    ),

  roles: () => apiClient<Items<Role>>('/roles'),
  role: (id: string) => apiClient<Role>(`/roles/${id}`),
  createRole: (data: Partial<Role>) =>
    apiClient<Role>('/roles', { method: 'POST', body: JSON.stringify(data) }),
  updateRole: (id: string, data: Partial<Role>) =>
    apiClient<Role>(`/roles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  rolePermissions: (id: string) =>
    apiClient<Items<Permission>>(`/roles/${id}/permissions`),
  updateRolePermissions: (id: string, permissionIds: string[]) =>
    apiClient<Items<Permission>>(`/roles/${id}/permissions`, {
      method: 'PUT',
      body: JSON.stringify({ permissionIds }),
    }),
  setRoleActive: (id: string, active: boolean) =>
    apiClient<Role>(`/roles/${id}/${active ? 'activate' : 'deactivate'}`, {
      method: 'PATCH',
    }),

  permissions: () => apiClient<Items<Permission>>('/permissions'),
  permission: (id: string) => apiClient<Permission>(`/permissions/${id}`),
  createPermission: (data: Partial<Permission>) =>
    apiClient<Permission>('/permissions', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updatePermission: (id: string, data: Partial<Permission>) =>
    apiClient<Permission>(`/permissions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  setPermissionsActive: (id: string, active: boolean) =>
    apiClient<Permission>(
      `/permissions/${id}/${active ? 'activate' : 'deactivate'}`,
      {
        method: 'PATCH',
      },
    ),

  catalogs: (endpoint: string) =>
    apiClient<Items<CatalogItem>>(`/${endpoint}?includeInactive=true`),
  createCatalog: (endpoint: string, data: Record<string, unknown>) =>
    apiClient<CatalogItem>(`/${endpoint}`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateCatalog: (
    endpoint: string,
    id: string,
    data: Record<string, unknown>,
  ) =>
    apiClient<CatalogItem>(`/${endpoint}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  setCatalogActive: (endpoint: string, id: string, active: boolean) =>
    apiClient<CatalogItem>(
      `/${endpoint}/${id}/${active ? 'activate' : 'deactivate'}`,
      { method: 'PATCH' },
    ),

  auditLogs: () => apiClient<{ items: AuditLog[] }>('/audit-logs'),
}
