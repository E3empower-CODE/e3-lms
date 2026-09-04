/**
 * Application status model (wire codes are snake_case). The server is
 * authoritative on which transitions are allowed and enforces them; this map
 * only decides which actions the UI offers, and unavailable ones are hidden.
 */
export const STATUS = {
  PENDING: 'pending',
  UNDER_REVIEW: 'under_review',
  APPROVED: 'approved',
  WAITLISTED: 'waitlisted',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled',
}

export const STATUS_LABELS = {
  pending: 'Pending',
  under_review: 'Under review',
  approved: 'Approved',
  waitlisted: 'Waitlisted',
  rejected: 'Rejected',
  cancelled: 'Cancelled',
}

/** Badge variant per status. */
export const STATUS_VARIANTS = {
  pending: 'info',
  under_review: 'warning',
  approved: 'success',
  waitlisted: 'warning',
  rejected: 'error',
  cancelled: 'neutral',
}

export const STATUS_FILTER_OPTIONS = [
  { value: '', label: 'All statuses' },
  ...Object.entries(STATUS_LABELS).map(([value, label]) => ({ value, label })),
]

/**
 * Allowed transitions per status. `action` is the transition subresource
 * (POST /applications/{id}/{action}/); `requiresReason` gates a reason field.
 */
export const TRANSITIONS = {
  pending: [
    { action: 'review', to: 'under_review', label: 'Start review', variant: 'secondary' },
    { action: 'approve', to: 'approved', label: 'Approve', variant: 'primary' },
    { action: 'waitlist', to: 'waitlisted', label: 'Waitlist', variant: 'secondary' },
    { action: 'reject', to: 'rejected', label: 'Reject', variant: 'danger', requiresReason: true },
    { action: 'cancel', to: 'cancelled', label: 'Cancel', variant: 'danger', requiresReason: true },
  ],
  under_review: [
    { action: 'approve', to: 'approved', label: 'Approve', variant: 'primary' },
    { action: 'waitlist', to: 'waitlisted', label: 'Waitlist', variant: 'secondary' },
    { action: 'reject', to: 'rejected', label: 'Reject', variant: 'danger', requiresReason: true },
    { action: 'cancel', to: 'cancelled', label: 'Cancel', variant: 'danger', requiresReason: true },
  ],
  waitlisted: [
    { action: 'approve', to: 'approved', label: 'Approve', variant: 'primary' },
    { action: 'reject', to: 'rejected', label: 'Reject', variant: 'danger', requiresReason: true },
    { action: 'cancel', to: 'cancelled', label: 'Cancel', variant: 'danger', requiresReason: true },
  ],
  approved: [
    { action: 'cancel', to: 'cancelled', label: 'Cancel', variant: 'danger', requiresReason: true },
  ],
  rejected: [],
  cancelled: [],
}

/** Transitions available from a given status (empty for terminal states). */
export function transitionsFor(status) {
  return TRANSITIONS[status] ?? []
}
