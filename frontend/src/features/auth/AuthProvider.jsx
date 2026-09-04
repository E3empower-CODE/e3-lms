import { useCallback, useEffect, useMemo, useState } from 'react'
import { AuthContext } from './AuthContext'
import * as authApi from '../../lib/authApi'

/**
 * Bootstraps the session from the current-user endpoint (cookie auth) and
 * exposes login/logout. No credentials are ever persisted client-side.
 */
export function AuthProvider({ children }) {
  const [status, setStatus] = useState('loading')
  const [user, setUser] = useState(null)
  const [error, setError] = useState(null)

  const bootstrap = useCallback(async () => {
    setStatus('loading')
    setError(null)
    try {
      const me = await authApi.fetchCurrentUser()
      setUser(me)
      setStatus('authenticated')
    } catch (err) {
      setUser(null)
      // 401 is the expected anonymous case; surface other errors for retry.
      setError(err.status === 401 ? null : err)
      setStatus('unauthenticated')
    }
  }, [])

  useEffect(() => {
    bootstrap()
  }, [bootstrap])

  const login = useCallback(async (credentials) => {
    const me = await authApi.login(credentials)
    setUser(me)
    setError(null)
    setStatus('authenticated')
    return me
  }, [])

  const logout = useCallback(async () => {
    try {
      await authApi.logout()
    } finally {
      setUser(null)
      setStatus('unauthenticated')
    }
  }, [])

  const value = useMemo(
    () => ({ status, user, error, login, logout, retry: bootstrap }),
    [status, user, error, login, logout, bootstrap],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
