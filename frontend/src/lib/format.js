/**
 * Display helpers. Money and dates arrive from the server already computed
 * (money as Decimal strings); these format for display only and never do
 * financial arithmetic on the client.
 */

/** Institution display timezone. Overridable via VITE_DISPLAY_TIMEZONE. */
export const DISPLAY_TIMEZONE =
  import.meta.env.VITE_DISPLAY_TIMEZONE || 'Africa/Lagos'

const DEFAULT_CURRENCY = import.meta.env.VITE_CURRENCY || 'NGN'

/** Format a server Decimal string / number as currency for display only. */
export function formatMoney(value, currency = DEFAULT_CURRENCY) {
  if (value == null || value === '') return '—'
  const amount = typeof value === 'string' ? Number(value) : value
  if (Number.isNaN(amount)) return String(value)
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
  }).format(amount)
}

/** Format an ISO 8601 UTC timestamp in the institution timezone. */
export function formatDateTime(iso, options = {}) {
  if (!iso) return '—'
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return String(iso)
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: DISPLAY_TIMEZONE,
    ...options,
  }).format(date)
}

/** Format a YYYY-MM-DD date (no time-of-day). */
export function formatDate(value) {
  if (!value) return '—'
  const date = new Date(`${value}T00:00:00`)
  if (Number.isNaN(date.getTime())) return String(value)
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(date)
}
