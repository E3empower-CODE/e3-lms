import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../features/auth/AuthContext'
import { Spinner } from '../components/Spinner/Spinner'

/**
 * Gate for authenticated routes. Loading → spinner; anonymous → redirect to
 * login (remembering the attempted path). This is UX only — the API enforces
 * authorization on every request.
 */
export function ProtectedRoute() {
  const { status } = useAuth()
  const location = useLocation()

  if (status === 'loading') {
    return <Spinner label="Checking your session…" />
  }

  if (status !== 'authenticated') {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}
