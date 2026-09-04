import { describe, it, expect } from 'vitest'
import { newPasswordSchema } from './passwordSchema'

describe('newPasswordSchema', () => {
  const schema = newPasswordSchema()

  it('accepts a matching pair of sufficient length', () => {
    const result = schema.safeParse({
      new_password: 'longenough1',
      confirm_password: 'longenough1',
    })
    expect(result.success).toBe(true)
  })

  it('rejects a short password', () => {
    const result = schema.safeParse({
      new_password: 'short',
      confirm_password: 'short',
    })
    expect(result.success).toBe(false)
  })

  it('flags a mismatch on the confirm field', () => {
    const result = schema.safeParse({
      new_password: 'longenough1',
      confirm_password: 'different1',
    })
    expect(result.success).toBe(false)
    const mismatch = result.error.issues.find((i) =>
      i.path.includes('confirm_password'),
    )
    expect(mismatch?.message).toBe('Passwords do not match')
  })
})
