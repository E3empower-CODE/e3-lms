import axios from 'axios'
import { emitSessionExpired } from './sessionEvents'

/**
 * Single axios instance for the E3 LMS API.
 *
 * Golden rules (see CLAUDE.md / API.md):
 * - Cookie auth: `withCredentials` sends the Django session cookie; credentials
 *   are never stored in localStorage/sessionStorage.
 * - CSRF: Django sets a `csrftoken` cookie and expects it echoed in the
 *   `X-CSRFToken` header on unsafe methods. axios does this automatically via
 *   `xsrfCookieName`/`xsrfHeaderName` when the cookie is readable same-site.
 * - snake_case on the wire; no client-side case transformation.
 */
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1'

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  xsrfCookieName: 'csrftoken',
  xsrfHeaderName: 'X-CSRFToken',
  headers: { Accept: 'application/json' },
})

/** Normalized API error surfaced to the UI. */
export class ApiError extends Error {
  constructor({ status, code, message, details, requestId }) {
    super(message)
    this.name = 'ApiError'
    this.status = status ?? null
    this.code = code ?? 'UNKNOWN'
    this.details = details ?? null
    this.requestId = requestId ?? null
  }

  /** True when the request failed to reach the server (network/timeout). */
  get isNetworkError() {
    return this.status === null
  }
}

/**
 * Normalize every rejection into an ApiError built from the documented error
 * envelope: `{ error: { code, message, details, request_id } }`.
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status ?? null
    const envelope = error.response?.data?.error
    // Signal session expiry so the auth layer can drop to unauthenticated.
    // AuthProvider ignores this unless a session was actually established, so
    // 401s during bootstrap or a failed login are harmless no-ops.
    if (status === 401) {
      emitSessionExpired()
    }
    return Promise.reject(
      new ApiError({
        status,
        code: envelope?.code,
        message:
          envelope?.message ||
          (status === null
            ? 'Unable to reach the server. Check your connection and try again.'
            : 'Something went wrong. Please try again.'),
        details: envelope?.details,
        requestId: envelope?.request_id,
      }),
    )
  },
)
