import { apiClient } from '../../lib/apiClient'
import { rows } from '../../lib/pagination'

/**
 * Instructor-scoped reads. Like the student portal these are "/me"-derived so
 * the client never selects a class it doesn't own; the server enforces
 * object-level class ownership and returns 403 for unassigned classes (a
 * higher admin may override server-side).
 */
const TEACHING = import.meta.env.VITE_TEACHING_PATH || '/me/teaching'

export async function fetchInstructorDashboard() {
  const response = await apiClient.get(`${TEACHING}/dashboard/`)
  return response.data
}

export async function fetchMyClasses() {
  const response = await apiClient.get(`${TEACHING}/classes/`)
  return rows(response)
}

/** Assigned class detail, including roster and content summaries. */
export async function fetchMyClass(id) {
  const response = await apiClient.get(`${TEACHING}/classes/${id}/`)
  return response.data
}
