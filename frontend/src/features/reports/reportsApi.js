import { apiClient } from '../../lib/apiClient'
import { listParams } from '../../lib/pagination'

/**
 * Report reads. Aggregations, row scope, and permissions are enforced
 * server-side; the client renders verified totals and never recomputes them.
 */
const REPORTS = import.meta.env.VITE_REPORTS_PATH || '/reports/'

export const REPORT_TYPES = [
  { value: 'admissions', label: 'Admissions' },
  { value: 'enrollment', label: 'Enrollment' },
  { value: 'completion', label: 'Completion' },
  { value: 'payments', label: 'Payments' },
]

/**
 * Fetch a report. Returns { summary:[{label,value}], series:[{label,value}],
 * columns:[{key,label}], rows:[...] } — all server-computed.
 */
export async function fetchReport(type, { from, to } = {}) {
  const response = await apiClient.get(`${REPORTS}${type}/`, {
    params: listParams({ date_from: from, date_to: to }),
  })
  return response.data
}
