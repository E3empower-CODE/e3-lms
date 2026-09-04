import { Outlet } from 'react-router-dom'
import { useAuth } from '../features/auth/AuthContext'
import { Forbidden } from './Forbidden'

/**
 * Restricts a route subtree to a set of roles. A signed-in user whose role is
 * not allowed sees a 403 page (the server also returns 403 for the API calls).
 *
 * @param {string[]} allow  allowed role codes
 */
export function RoleRoute({ allow }) {
  const { user } = useAuth()

  if (!user || !allow.includes(user.role)) {
    return <Forbidden />
  }

  return <Outlet />
}
