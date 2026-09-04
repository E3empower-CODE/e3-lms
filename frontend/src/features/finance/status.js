/** Payment status model (wire codes snake_case). */
export const PAYMENT_STATUS = {
  COMPLETED: 'completed',
  PENDING: 'pending',
  REVERSED: 'reversed',
  VOID: 'void',
}

export const PAYMENT_STATUS_LABELS = {
  completed: 'Completed',
  pending: 'Pending',
  reversed: 'Reversed',
  void: 'Void',
}

export const PAYMENT_STATUS_VARIANTS = {
  completed: 'success',
  pending: 'warning',
  reversed: 'neutral',
  void: 'error',
}

export const PAYMENT_STATUS_FILTER_OPTIONS = [
  { value: '', label: 'All statuses' },
  ...Object.entries(PAYMENT_STATUS_LABELS).map(([value, label]) => ({ value, label })),
]

export const PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash' },
  { value: 'bank_transfer', label: 'Bank transfer' },
  { value: 'card', label: 'Card' },
  { value: 'mobile_money', label: 'Mobile money' },
  { value: 'cheque', label: 'Cheque' },
]

const METHOD_LABELS = Object.fromEntries(PAYMENT_METHODS.map((m) => [m.value, m.label]))

export function methodLabel(method) {
  return METHOD_LABELS[method] || method || '—'
}

/** Whether a completed payment can still be reversed. */
export function canReverse(status) {
  return status === PAYMENT_STATUS.COMPLETED
}
