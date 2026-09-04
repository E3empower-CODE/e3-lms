import { apiClient } from '../../lib/apiClient'
import { rows, pageInfo, listParams } from '../../lib/pagination'

/**
 * Finance reads/writes. Writes are finance-only and audited; originals are
 * never deleted or silently rewritten (corrections use explicit reversals).
 * All totals are server-calculated — the client never derives balances.
 */
const PAYMENTS_PATH = import.meta.env.VITE_PAYMENTS_PATH || '/payments/'
const STUDENTS_PATH = import.meta.env.VITE_STUDENTS_PATH || '/students/'

export async function fetchPayments({ page, search, status } = {}) {
  const response = await apiClient.get(PAYMENTS_PATH, {
    params: listParams({
      page,
      search,
      ordering: '-paid_on',
      ...(status ? { status } : {}),
    }),
  })
  return { rows: rows(response), pagination: pageInfo(response) }
}

/** Server-calculated balance for a student (fee snapshot minus allocations). */
export async function fetchStudentBalance(studentId) {
  const response = await apiClient.get(`${STUDENTS_PATH}${studentId}/balance/`)
  return response.data
}

/** Record a payment (finance-only). The server assigns the receipt number and
 * recalculates the balance; overpayment policy is enforced server-side. */
export async function recordPayment(payment) {
  const response = await apiClient.post(PAYMENTS_PATH, payment)
  return response.data
}

/** Reverse a completed payment with a reason (creates an explicit reversal). */
export async function reversePayment(paymentId, { reason }) {
  const response = await apiClient.post(`${PAYMENTS_PATH}${paymentId}/reverse/`, {
    reason,
  })
  return response.data
}
