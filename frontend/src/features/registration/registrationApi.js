import { apiClient } from '../../lib/apiClient'
import { rows } from '../../lib/pagination'

const CATALOG_PATH = import.meta.env.VITE_COURSES_PATH || '/courses/'
const REGISTRATION_PATH =
  import.meta.env.VITE_REGISTRATION_PATH || '/applications/'

/**
 * Public course catalog for the registration step. Courses, prices, and
 * availability come from the backend (never hardcoded); the fee shown is the
 * server's snapshot value.
 */
export async function fetchCourses() {
  const response = await apiClient.get(CATALOG_PATH, {
    params: { active: true, page_size: 100 },
  })
  return rows(response)
}

/**
 * Submit the application as multipart (passport photo is a file). The server
 * recalculates age and fees, persists atomically, and returns the assigned
 * application number — the client total is never authoritative.
 */
export async function submitApplication(draft) {
  const form = new FormData()

  const appendScalar = (key, value) => {
    if (value === undefined || value === null || value === '') return
    form.append(key, typeof value === 'boolean' ? String(value) : value)
  }

  for (const [key, value] of Object.entries(draft)) {
    // Skip the file (appended below) and display-only keys (underscore-prefixed).
    if (key === 'passport_photo' || key.startsWith('_')) continue
    if (key === 'course_ids' && Array.isArray(value)) {
      value.forEach((id) => form.append('course_ids', String(id)))
      continue
    }
    appendScalar(key, value)
  }

  if (draft.passport_photo instanceof File) {
    form.append('passport_photo', draft.passport_photo)
  }

  const response = await apiClient.post(REGISTRATION_PATH, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return response.data
}
