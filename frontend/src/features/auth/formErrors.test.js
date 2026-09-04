import { describe, it, expect, vi } from 'vitest'
import { applyServerFieldErrors } from './formErrors'

describe('applyServerFieldErrors', () => {
  it('maps allowlisted fields and joins array messages', () => {
    const setError = vi.fn()
    applyServerFieldErrors(
      { details: { email: ['Already taken.', 'Try another.'] } },
      setError,
      ['email', 'password'],
    )
    expect(setError).toHaveBeenCalledWith('email', {
      message: 'Already taken. Try another.',
    })
    expect(setError).toHaveBeenCalledTimes(1)
  })

  it('ignores fields outside the allowlist and missing details', () => {
    const setError = vi.fn()
    applyServerFieldErrors({ details: { role: ['nope'] } }, setError, ['email'])
    applyServerFieldErrors({}, setError, ['email'])
    applyServerFieldErrors(null, setError, ['email'])
    expect(setError).not.toHaveBeenCalled()
  })
})
