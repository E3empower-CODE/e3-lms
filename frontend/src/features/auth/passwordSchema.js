import { z } from 'zod'

/** Minimum client-side password policy (the server remains authoritative). */
export const passwordField = z
  .string()
  .min(8, 'Use at least 8 characters')
  .max(128, 'Password is too long')

/** A new-password + confirmation pair with a match refinement. */
export function newPasswordSchema(extra = {}) {
  return z
    .object({
      new_password: passwordField,
      confirm_password: z.string().min(1, 'Please confirm your password'),
      ...extra,
    })
    .refine((data) => data.new_password === data.confirm_password, {
      path: ['confirm_password'],
      message: 'Passwords do not match',
    })
}
