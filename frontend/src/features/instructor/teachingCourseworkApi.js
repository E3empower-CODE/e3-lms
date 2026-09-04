import { apiClient } from '../../lib/apiClient'
import { rows } from '../../lib/pagination'

/**
 * Instructor-scoped coursework + grading. Writes are restricted server-side to
 * the assigned instructor (or a higher admin) and each grade change is audited.
 */
const TEACHING = import.meta.env.VITE_TEACHING_PATH || '/me/teaching'

/** Assignments and assessments for one assigned class. */
export async function fetchClassCoursework(classId) {
  const response = await apiClient.get(`${TEACHING}/classes/${classId}/coursework/`)
  return response.data
}

/** Submissions for an assignment the instructor owns. */
export async function fetchAssignmentSubmissions(assignmentId) {
  const response = await apiClient.get(
    `${TEACHING}/assignments/${assignmentId}/submissions/`,
  )
  return rows(response)
}

/** Record a grade + feedback for a submission (audited). */
export async function gradeSubmission(submissionId, { score, feedback }) {
  const response = await apiClient.post(
    `${TEACHING}/submissions/${submissionId}/grade/`,
    { score, feedback },
  )
  return response.data
}

/** Attempts/results for an assessment the instructor owns. */
export async function fetchAssessmentResults(assessmentId) {
  const response = await apiClient.get(
    `${TEACHING}/assessments/${assessmentId}/results/`,
  )
  return rows(response)
}

/** Manually grade an attempt (e.g. short-text questions). Audited. */
export async function gradeAttempt(attemptId, { score, feedback }) {
  const response = await apiClient.post(
    `${TEACHING}/attempts/${attemptId}/grade/`,
    { score, feedback },
  )
  return response.data
}
