import { describe, it, expect } from 'vitest'
import {
  ATTENDANCE_STATUS,
  ATTENDANCE_OPTIONS,
  ATTENDANCE_STATUS_VARIANTS,
  nextStatus,
} from './status'

describe('nextStatus', () => {
  it('cycles present → absent → late → excused → present', () => {
    expect(nextStatus(ATTENDANCE_STATUS.PRESENT)).toBe(ATTENDANCE_STATUS.ABSENT)
    expect(nextStatus(ATTENDANCE_STATUS.ABSENT)).toBe(ATTENDANCE_STATUS.LATE)
    expect(nextStatus(ATTENDANCE_STATUS.LATE)).toBe(ATTENDANCE_STATUS.EXCUSED)
    expect(nextStatus(ATTENDANCE_STATUS.EXCUSED)).toBe(ATTENDANCE_STATUS.PRESENT)
  })

  it('defaults an unknown status to the start of the cycle', () => {
    expect(nextStatus('mystery')).toBe(ATTENDANCE_STATUS.PRESENT)
  })
})

describe('attendance presentation', () => {
  it('offers all four statuses with a badge variant each', () => {
    expect(ATTENDANCE_OPTIONS).toHaveLength(4)
    for (const code of Object.values(ATTENDANCE_STATUS)) {
      expect(ATTENDANCE_STATUS_VARIANTS[code]).toBeTruthy()
    }
  })
})
