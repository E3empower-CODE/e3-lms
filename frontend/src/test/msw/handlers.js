import { http, HttpResponse } from 'msw'

/**
 * Default API mocks for component/integration tests. The base matches
 * apiClient's fallback (VITE_API_BASE_URL is unset under test). Tests override
 * per-case with `server.use(...)`.
 */
export const API_BASE = 'http://localhost:8000/api/v1'

/** Build the collection envelope: { data, pagination }. */
export function collection(data, pagination = {}) {
  return HttpResponse.json({
    data,
    pagination: {
      page: 1,
      page_size: 20,
      total_items: data.length,
      total_pages: 1,
      ...pagination,
    },
  })
}

/** Build the error envelope. */
export function apiError(status, code, message, details) {
  return HttpResponse.json(
    { error: { code, message, details, request_id: 'test-req' } },
    { status },
  )
}

export const handlers = [
  // Anonymous by default; a test authenticates by overriding this handler.
  http.get(`${API_BASE}/auth/me/`, () =>
    apiError(401, 'NOT_AUTHENTICATED', 'Authentication required.'),
  ),
  http.get(`${API_BASE}/health/`, () => HttpResponse.json({ status: 'ok' })),
]
