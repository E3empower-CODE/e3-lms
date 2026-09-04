/**
 * Lightweight bus for auth/session events decoupled from the router, so the
 * axios layer can signal an expired session without importing React.
 */
export const SESSION_EXPIRED = 'e3:session-expired'

/** Emit when an authenticated request returns 401 mid-session. */
export function emitSessionExpired() {
  window.dispatchEvent(new CustomEvent(SESSION_EXPIRED))
}

/** Subscribe to session-expired; returns an unsubscribe function. */
export function onSessionExpired(handler) {
  window.addEventListener(SESSION_EXPIRED, handler)
  return () => window.removeEventListener(SESSION_EXPIRED, handler)
}
