/**
 * Map server field errors from the `{ error: { details } }` envelope onto a
 * react-hook-form `setError`. Only the allowlisted fields are applied so
 * unexpected keys don't create phantom errors; the envelope `message` is shown
 * separately as a form-level alert.
 */
export function applyServerFieldErrors(err, setError, fields) {
  const details = err?.details
  if (!details || typeof details !== 'object') return
  for (const field of fields) {
    if (details[field]) {
      setError(field, { message: [].concat(details[field]).join(' ') })
    }
  }
}
