import { apiClient } from './apiClient'

/**
 * Auth endpoints.
 *
 * NOTE: exact login/logout/current-user paths are finalized with backend
 * Phase 1 (see API.md — "The exact login/logout/current-user paths will be
 * finalized with Phase 1 tests"). They are centralized here so a single edit
 * updates the whole app. Overridable via env for early integration.
 */
export const AUTH_PATHS = {
  login: import.meta.env.VITE_AUTH_LOGIN_PATH || '/auth/login/',
  logout: import.meta.env.VITE_AUTH_LOGOUT_PATH || '/auth/logout/',
  currentUser: import.meta.env.VITE_AUTH_ME_PATH || '/auth/me/',
}

/** Fetch the authenticated user. Rejects with ApiError (401 when anonymous). */
export async function fetchCurrentUser() {
  const response = await apiClient.get(AUTH_PATHS.currentUser)
  return response.data
}

/** Log in with cookie-based credentials. Returns the current user. */
export async function login(credentials) {
  await apiClient.post(AUTH_PATHS.login, credentials)
  return fetchCurrentUser()
}

/** Log out; clears the server session cookie. */
export async function logout() {
  await apiClient.post(AUTH_PATHS.logout)
}
