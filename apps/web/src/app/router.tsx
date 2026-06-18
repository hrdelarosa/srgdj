import { Redirect, Route, Switch } from 'wouter'
import { PublicOnlyRoute } from './routes/PublicOnlyRoute'
import { PrivateRoute } from './routes/PrivateRoute'
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
        <PrivateRoute>
          <AdminUsersPage />
        </PrivateRoute>
      </Route>

      <Route path="/admin/roles">
        <PrivateRoute>
          <AdminRolesPage />
        </PrivateRoute>
      </Route>

      <Route path="/admin/permissions">
        <PrivateRoute>
          <AdminPermissionsPage />
        </PrivateRoute>
      </Route>

      <Route path="/admin/catalogs">
        <PrivateRoute>
          <AdminCatalogsPage />
        </PrivateRoute>
      </Route>

      <Route path="/admin/audit">
        <PrivateRoute>
          <AdminAuditPage />
        </PrivateRoute>
      </Route>

      <Route>
        <NotFoundPage />
      </Route>
    </Switch>
  )
}
