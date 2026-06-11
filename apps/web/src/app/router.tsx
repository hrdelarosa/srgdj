import { Redirect, Route, Switch } from 'wouter'
import { PublicOnlyRoute } from './routes/PublicOnlyRoute'
import { PrivateRoute } from './routes/PrivateRoute'
import { DashboardPage } from './pages/Home'
import { LoginPage } from './pages/Login'
import { NotFoundPage } from './pages/NotFoundPage'

export function AppRouter() {
  return (
    <Switch>
      <Route path="/">
        <Redirect to="/dashboard" />
      </Route>

      <Route path="/login">
        <PublicOnlyRoute>
          <LoginPage />
        </PublicOnlyRoute>
      </Route>

      <Route path="/dashboard">
        <PrivateRoute>
          <DashboardPage />
        </PrivateRoute>
      </Route>

      <Route>
        <NotFoundPage />
      </Route>
    </Switch>
  )
}
