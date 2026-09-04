import { apiClient } from '../../lib/apiClient'
import { rows } from '../../lib/pagination'

/**
 * Student-scoped ("/me") coursework. Assessment reads return student-safe
 * payloads only — correct answers are never sent to the client, and scores are
 * server-authoritative.
 */
const ME = import.meta.env.VITE_ME_PATH || '/me'

// --- Assignments ---

export async function fetchMyAssignments() {
  const response = await apiClient.get(`${ME}/assignments/`)
  return rows(response)
}

export async function fetchMyAssignment(id) {
  const response = await apiClient.get(`${ME}/assignments/${id}/`)
  return response.data
}

/** Submit an assignment (text and/or file) as multipart. */
export async function submitAssignment(id, { text, file } = {}) {
  const form = new FormData()
  if (text) form.append('text', text)
  if (file instanceof File) form.append('file', file)
  const response = await apiClient.post(`${ME}/assignments/${id}/submissions/`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return response.data
}

// --- Assessments ---

export async function fetchMyAssessments() {
  const response = await apiClient.get(`${ME}/assessments/`)
  return rows(response)
}

/** Student-safe assessment detail (questions/choices without answers). */
export async function fetchMyAssessment(id) {
  const response = await apiClient.get(`${ME}/assessments/${id}/`)
  return response.data
}

/** Start (or resume) an attempt; the server enforces attempt limits/time. */
export async function startAssessmentAttempt(id) {
  const response = await apiClient.post(`${ME}/assessments/${id}/attempts/`)
  return response.data
}

/**
 * Submit answers for an attempt. `answers` maps question_id -> value
 * (choice id, array of choice ids, or text). Returns the server-scored result.
 */
export async function submitAssessmentAttempt(id, attemptId, answers) {
  const response = await apiClient.post(
    `${ME}/assessments/${id}/attempts/${attemptId}/submit/`,
    { answers },
  )
  return response.data
}
