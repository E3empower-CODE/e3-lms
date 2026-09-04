import { describe, it, expect } from 'vitest'
import {
  ASSIGNMENT_STATUS,
  canSubmitAssignment,
  attemptsRemaining,
} from './status'

describe('canSubmitAssignment', () => {
  it('allows submission while open or overdue, not once submitted/graded', () => {
    expect(canSubmitAssignment(ASSIGNMENT_STATUS.OPEN)).toBe(true)
    expect(canSubmitAssignment(ASSIGNMENT_STATUS.OVERDUE)).toBe(true)
    expect(canSubmitAssignment(ASSIGNMENT_STATUS.SUBMITTED)).toBe(false)
    expect(canSubmitAssignment(ASSIGNMENT_STATUS.GRADED)).toBe(false)
  })
})

describe('attemptsRemaining', () => {
  it('returns null when attempts are unlimited', () => {
    expect(attemptsRemaining({ attempts_used: 3 })).toBeNull()
  })

  it('never goes below zero', () => {
    expect(attemptsRemaining({ attempts_allowed: 3, attempts_used: 1 })).toBe(2)
    expect(attemptsRemaining({ attempts_allowed: 2, attempts_used: 5 })).toBe(0)
    expect(attemptsRemaining({ attempts_allowed: 3 })).toBe(3)
  })
})
