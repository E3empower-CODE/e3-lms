import { createContext, useContext } from 'react'

/**
 * Auth context value shape:
 *   { status, user, error, login, logout }
 * status: 'loading' | 'authenticated' | 'unauthenticated'
 *
 * Kept separate from the provider component so the module exports only
 * non-components (context + hook), satisfying react-refresh lint rules.
 */
export const AuthContext = createContext(null)

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (ctx === null) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return ctx
}
