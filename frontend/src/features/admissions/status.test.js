import { describe, it, expect } from 'vitest'
import { STATUS, transitionsFor, STATUS_VARIANTS, STATUS_LABELS } from './status'

describe('transitionsFor', () => {
  it('offers the full set from pending, with reasons on destructive actions', () => {
    const actions = transitionsFor(STATUS.PENDING).map((t) => t.action)
    expect(actions).toEqual(['review', 'approve', 'waitlist', 'reject', 'cancel'])
    const reject = transitionsFor(STATUS.PENDING).find((t) => t.action === 'reject')
    expect(reject.requiresReason).toBe(true)
  })

  it('narrows options once under review and approved', () => {
    expect(transitionsFor(STATUS.UNDER_REVIEW).map((t) => t.action)).not.toContain('review')
    expect(transitionsFor(STATUS.APPROVED).map((t) => t.action)).toEqual(['cancel'])
  })

  it('treats rejected and cancelled as terminal', () => {
    expect(transitionsFor(STATUS.REJECTED)).toEqual([])
    expect(transitionsFor(STATUS.CANCELLED)).toEqual([])
    expect(transitionsFor('unknown')).toEqual([])
  })
})

describe('status presentation', () => {
  it('has a label and badge variant for every status', () => {
    for (const code of Object.values(STATUS)) {
      expect(STATUS_LABELS[code]).toBeTruthy()
      expect(STATUS_VARIANTS[code]).toBeTruthy()
    }
  })
})
