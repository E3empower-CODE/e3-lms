import { apiClient } from '../../lib/apiClient'
import { rows, pageInfo, listParams } from '../../lib/pagination'

const APPLICATIONS_PATH =
  import.meta.env.VITE_APPLICATIONS_PATH || '/applications/'

/** Paginated, filterable applications list. */
export async function fetchApplications({ page, search, status, ordering } = {}) {
  const response = await apiClient.get(APPLICATIONS_PATH, {
    params: listParams({
      page,
      search,
      ordering: ordering || '-created_at',
      ...(status ? { status } : {}),
    }),
  })
  return { rows: rows(response), pagination: pageInfo(response) }
}

/** Single application detail. */
export async function fetchApplication(id) {
  const response = await apiClient.get(`${APPLICATIONS_PATH}${id}/`)
  return response.data
}

/** Admissions dashboard metrics (counts by status, totals). */
export async function fetchAdmissionsMetrics() {
  const response = await apiClient.get(`${APPLICATIONS_PATH}metrics/`)
  return response.data
}

/**
 * Apply a workflow transition via its explicit subresource action. The server
 * enforces the allowed matrix and records an audit event; returns the updated
 * application.
 */
export async function transitionApplication(id, action, { reason } = {}) {
  const response = await apiClient.post(
    `${APPLICATIONS_PATH}${id}/${action}/`,
    reason ? { reason } : {},
  )
  return response.data
}

/** Add an admissions note to an application. */
export async function addApplicationNote(id, body) {
  const response = await apiClient.post(`${APPLICATIONS_PATH}${id}/notes/`, {
    body,
  })
  return response.data
}
