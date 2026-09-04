/** Assignment status model (wire codes snake_case). */
export const ASSIGNMENT_STATUS = {
  OPEN: 'open',
  SUBMITTED: 'submitted',
  GRADED: 'graded',
  OVERDUE: 'overdue',
}

export const ASSIGNMENT_STATUS_LABELS = {
  open: 'Open',
  submitted: 'Submitted',
  graded: 'Graded',
  overdue: 'Overdue',
}

export const ASSIGNMENT_STATUS_VARIANTS = {
  open: 'info',
  submitted: 'neutral',
  graded: 'success',
  overdue: 'error',
}

/** Whether a student may still submit (open or overdue-but-accepting). */
export function canSubmitAssignment(status) {
  return status === ASSIGNMENT_STATUS.OPEN || status === ASSIGNMENT_STATUS.OVERDUE
}

/** Remaining attempts for an assessment (null = unlimited). */
export function attemptsRemaining({ attempts_allowed, attempts_used } = {}) {
  if (attempts_allowed == null) return null
  return Math.max(0, attempts_allowed - (attempts_used ?? 0))
}
