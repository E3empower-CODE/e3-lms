import { apiClient } from '../../lib/apiClient'

/**
 * Instructor attendance. Writes are restricted to the assigned instructor and
 * validated against class enrollment server-side; the bulk save is idempotent
 * (one record per student per session) and audited.
 */
const TEACHING = import.meta.env.VITE_TEACHING_PATH || '/me/teaching'

/** Roster for a class on a date, with any existing marks. */
export async function fetchClassAttendance(classId, date) {
  const response = await apiClient.get(`${TEACHING}/classes/${classId}/attendance/`, {
    params: { date },
  })
  return response.data
}

/** Idempotent bulk save of a roster's marks for a date. */
export async function saveClassAttendance(classId, date, records) {
  const response = await apiClient.post(`${TEACHING}/classes/${classId}/attendance/`, {
    date,
    records,
  })
  return response.data
}
