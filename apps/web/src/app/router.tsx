import { Redirect, Route, Switch } from 'wouter'
import { PublicOnlyRoute } from './routes/PublicOnlyRoute'
import { PrivateRoute } from './routes/PrivateRoute'
import { PermissionRoute } from './routes/PermissionRoute'
import { HomePage } from './pages/Home'
import { LoginPage } from './pages/Login'
import { NotFoundPage } from './pages/NotFoundPage'
import { DocumentsPage } from './pages/Documents'
import { DocumentDetailPage } from './pages/DocumentDetail'
import { CreateDocumentPage } from './pages/CreateDocument'
import { EditDocumentPage } from './pages/EditDocument'
import { AdminUsersPage } from './pages/AdminUsers'
import { AdminRolesPage } from './pages/AdminRoles'
import { AdminPermissionsPage } from './pages/AdminPermissions'
import { AdminCatalogsPage } from './pages/AdminCatalogs'
import { AdminAuditPage } from './pages/AdminAudit'

export function AppRouter() {
  return (
    <Switch>
      <Route path="/">
        <Redirect to="/home" />
      </Route>

      <Route path="/login">
        <PublicOnlyRoute>
          <LoginPage />
        </PublicOnlyRoute>
      </Route>

      <Route path="/home">
        <PrivateRoute>
          <HomePage />
        </PrivateRoute>
      </Route>

      <Route path="/documents">
        <PrivateRoute>
          <DocumentsPage />
        </PrivateRoute>
      </Route>

      <Route path="/documents/create">
        <PrivateRoute>
          <CreateDocumentPage />
        </PrivateRoute>
      </Route>

      <Route path="/documents/:id/edit">
        <PrivateRoute>
          <EditDocumentPage />
        </PrivateRoute>
      </Route>

      <Route path="/documents/:id">
        <PrivateRoute>
          <DocumentDetailPage />
        </PrivateRoute>
      </Route>

      <Route path="/admin/users">
        <PermissionRoute permission="users:read">
          <AdminUsersPage />
        </PermissionRoute>
      </Route>

      <Route path="/admin/roles">
        <PermissionRoute permission="roles:read">
          <AdminRolesPage />
        </PermissionRoute>
      </Route>

      <Route path="/admin/permissions">
        <PermissionRoute permission="permissions:read">
          <AdminPermissionsPage />
        </PermissionRoute>
      </Route>

      <Route path="/admin/catalogs">
        <PermissionRoute permission="catalogs:read">
          <AdminCatalogsPage />
        </PermissionRoute>
      </Route>

      <Route path="/admin/audit">
        <PermissionRoute permission="audit:read">
          <AdminAuditPage />
        </PermissionRoute>
      </Route>

      <Route>
        <NotFoundPage />
      </Route>
    </Switch>
  )
}
