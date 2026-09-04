import { describe, it, expect } from 'vitest'
import { ageFromBirthDate, isMinor } from './age'

const at = new Date('2026-09-04T00:00:00')

describe('ageFromBirthDate', () => {
  it('computes whole years, accounting for month/day', () => {
    expect(ageFromBirthDate('2000-01-01', at)).toBe(26)
    expect(ageFromBirthDate('2000-12-31', at)).toBe(25) // birthday not yet reached
  })

  it('returns null for missing or invalid input', () => {
    expect(ageFromBirthDate('', at)).toBeNull()
    expect(ageFromBirthDate('not-a-date', at)).toBeNull()
  })
})

describe('isMinor', () => {
  it('is true just under 18 and false at/over 18', () => {
    expect(isMinor('2009-09-05', at)).toBe(true) // turns 17
    expect(isMinor('2008-09-04', at)).toBe(false) // exactly 18 today
    expect(isMinor('1990-01-01', at)).toBe(false)
  })

  it('is false when birth date is unknown (guardian step not forced yet)', () => {
    expect(isMinor('', at)).toBe(false)
  })
})
