/**
 * Compute whole-years age from a YYYY-MM-DD birth date at a reference date
 * (default: today). Mirrors how the server evaluates the under-18 rule at
 * submission; the client uses it only to decide whether to require guardian
 * details — the backend re-evaluates authoritatively.
 */
export function ageFromBirthDate(birthDate, at = new Date()) {
  if (!birthDate) return null
  const dob = new Date(`${birthDate}T00:00:00`)
  if (Number.isNaN(dob.getTime())) return null
  let age = at.getFullYear() - dob.getFullYear()
  const monthDiff = at.getMonth() - dob.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && at.getDate() < dob.getDate())) {
    age -= 1
  }
  return age
}

export const MINOR_AGE = 18

/** True when the applicant is a minor and must supply guardian details. */
export function isMinor(birthDate, at = new Date()) {
  const age = ageFromBirthDate(birthDate, at)
  return age != null && age < MINOR_AGE
}
