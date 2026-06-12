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

      <Route path="/documents/new">
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

      <Route>
        <NotFoundPage />
      </Route>
    </Switch>
  )
}
