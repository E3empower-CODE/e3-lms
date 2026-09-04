import { apiClient } from '../../lib/apiClient'
import { rows } from '../../lib/pagination'

/**
 * Student-scoped ("/me") reads. The server derives the student from the
 * session, so the client never passes a student id — this prevents choosing
 * arbitrary students and enforces self-only access server-side.
 */
const ME = import.meta.env.VITE_ME_PATH || '/me'

export async function fetchStudentDashboard() {
  const response = await apiClient.get(`${ME}/dashboard/`)
  return response.data
}

export async function fetchMyCourses() {
  const response = await apiClient.get(`${ME}/courses/`)
  return rows(response)
}

/** Course/enrollment detail with modules and lessons for the current student. */
export async function fetchMyCourse(id) {
  const response = await apiClient.get(`${ME}/courses/${id}/`)
  return response.data
}

/** A single lesson's content and resources. */
export async function fetchMyLesson(lessonId) {
  const response = await apiClient.get(`${ME}/lessons/${lessonId}/`)
  return response.data
}

/**
 * Mark a lesson complete. Progress is server-authoritative; the returned
 * payload carries the updated lesson/course progress the UI renders.
 */
export async function completeMyLesson(lessonId) {
  const response = await apiClient.post(`${ME}/lessons/${lessonId}/complete/`)
  return response.data
}
