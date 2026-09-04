/**
 * Roles and their allowed application shell.
 * Values are the `snake_case` role codes returned by the API (PLAN.md — Roles
 * and Access). The frontend only routes/hides on these; the server enforces
 * authorization on every request.
 */
export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMISSIONS: 'admissions',
  FINANCE: 'finance',
  INSTRUCTOR: 'instructor',
  STUDENT: 'student',
}

/** Roles that use the admin shell. */
export const ADMIN_ROLES = [ROLES.SUPER_ADMIN, ROLES.ADMISSIONS, ROLES.FINANCE]

/** Roles permitted to convert an approved application into a student.
 * The server enforces this too; the UI only hides the action otherwise. */
export const STUDENT_CONVERT_ROLES = [ROLES.SUPER_ADMIN, ROLES.ADMISSIONS]

export function canConvertApplications(role) {
  return STUDENT_CONVERT_ROLES.includes(role)
}

/** Landing route for a role after login / on visiting `/`. */
export function homePathForRole(role) {
  if (ADMIN_ROLES.includes(role)) return '/admin'
  if (role === ROLES.INSTRUCTOR) return '/instructor'
  if (role === ROLES.STUDENT) return '/student'
  return '/login'
}

/** Human-readable label for a role code. */
export function roleLabel(role) {
  switch (role) {
    case ROLES.SUPER_ADMIN:
      return 'Super Admin'
    case ROLES.ADMISSIONS:
      return 'Admissions'
    case ROLES.FINANCE:
      return 'Finance Officer'
    case ROLES.INSTRUCTOR:
      return 'Instructor'
    case ROLES.STUDENT:
      return 'Student'
    default:
      return 'User'
  }
}
