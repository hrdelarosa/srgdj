import { Redirect, Route, Switch } from 'wouter'
import { PublicOnlyRoute } from './routes/PublicOnlyRoute'
import { PrivateRoute } from './routes/PrivateRoute'
import { HomePage } from './pages/Home'
import { LoginPage } from './pages/Login'
import { NotFoundPage } from './pages/NotFoundPage'
import { DocumentsPage } from './pages/Documents'
import { DocumentDetailPage } from './pages/DocumentDetail'

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
