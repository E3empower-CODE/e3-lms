/**
 * Validate a grade a human is entering. The server re-validates and audits the
 * change; this is only to catch obvious mistakes before submitting.
 * @returns {string|null} an error message, or null when valid.
 */
export function validateScore(value, maxScore) {
  if (value === '' || value == null) return 'Enter a score'
  const num = Number(value)
  if (Number.isNaN(num)) return 'Score must be a number'
  if (num < 0) return 'Score can’t be negative'
  if (maxScore != null && num > maxScore) return `Score can’t exceed ${maxScore}`
  return null
}
