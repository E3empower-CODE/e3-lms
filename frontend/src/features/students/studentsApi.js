import { apiClient } from '../../lib/apiClient'
import { rows, pageInfo, listParams } from '../../lib/pagination'

const STUDENTS_PATH = import.meta.env.VITE_STUDENTS_PATH || '/students/'
const APPLICATIONS_PATH =
  import.meta.env.VITE_APPLICATIONS_PATH || '/applications/'

/** Paginated, searchable students list. */
export async function fetchStudents({ page, search, ordering } = {}) {
  const response = await apiClient.get(STUDENTS_PATH, {
    params: listParams({ page, search, ordering: ordering || 'last_name' }),
  })
  return { rows: rows(response), pagination: pageInfo(response) }
}

/** Student detail. The server redacts sensitive identity fields by role, so
 * the client renders whatever it receives rather than assuming fields exist. */
export async function fetchStudent(id) {
  const response = await apiClient.get(`${STUDENTS_PATH}${id}/`)
  return response.data
}

/**
 * Convert an approved application into a student. Idempotent and transactional
 * server-side; a repeat or race yields one student. `force` proceeds past a
 * duplicate-review warning after a human has reviewed the candidates.
 */
export async function convertApplication(applicationId, { force = false } = {}) {
  const response = await apiClient.post(
    `${APPLICATIONS_PATH}${applicationId}/convert/`,
    force ? { force: true } : {},
  )
  return response.data
}
