import { Navigate } from 'react-router-dom'
import { useAuth } from '../features/auth/AuthContext'
import { Spinner } from '../components/Spinner/Spinner'
import { homePathForRole } from '../lib/roles'

/** Sends `/` to the correct shell for the signed-in role, or to login. */
export function RootRedirect() {
  const { status, user } = useAuth()

  if (status === 'loading') {
    return <Spinner label="Loading…" />
  }
  if (status !== 'authenticated') {
    return <Navigate to="/login" replace />
  }
  return <Navigate to={homePathForRole(user.role)} replace />
}
