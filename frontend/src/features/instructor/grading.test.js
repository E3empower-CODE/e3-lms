import { describe, it, expect } from 'vitest'
import { validateScore } from './grading'

describe('validateScore', () => {
  it('requires a value', () => {
    expect(validateScore('', 10)).toBe('Enter a score')
    expect(validateScore(null, 10)).toBe('Enter a score')
  })

  it('rejects non-numbers and negatives', () => {
    expect(validateScore('abc', 10)).toBe('Score must be a number')
    expect(validateScore(-1, 10)).toBe('Score can’t be negative')
  })

  it('enforces the max when one is given', () => {
    expect(validateScore(11, 10)).toBe('Score can’t exceed 10')
    expect(validateScore(10, 10)).toBeNull()
    expect(validateScore(0, 10)).toBeNull()
  })

  it('accepts any non-negative number when no max is set', () => {
    expect(validateScore(999)).toBeNull()
  })
})
