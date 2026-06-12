import { Redirect, Route, Switch } from 'wouter'
import { PublicOnlyRoute } from './routes/PublicOnlyRoute'
import { PrivateRoute } from './routes/PrivateRoute'
import { HomePage } from './pages/Home'
import { LoginPage } from './pages/Login'
import { NotFoundPage } from './pages/NotFoundPage'

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

      <Route>
        <NotFoundPage />
      </Route>
    </Switch>
  )
}
