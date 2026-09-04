import { describe, it, expect } from 'vitest'
import {
  PAYMENT_STATUS,
  canReverse,
  methodLabel,
  PAYMENT_STATUS_VARIANTS,
  PAYMENT_STATUS_LABELS,
} from './status'

describe('canReverse', () => {
  it('allows reversing only completed payments', () => {
    expect(canReverse(PAYMENT_STATUS.COMPLETED)).toBe(true)
    expect(canReverse(PAYMENT_STATUS.REVERSED)).toBe(false)
    expect(canReverse(PAYMENT_STATUS.VOID)).toBe(false)
    expect(canReverse(PAYMENT_STATUS.PENDING)).toBe(false)
  })
})

describe('methodLabel', () => {
  it('maps known methods and falls back gracefully', () => {
    expect(methodLabel('bank_transfer')).toBe('Bank transfer')
    expect(methodLabel('unknown')).toBe('unknown')
    expect(methodLabel(null)).toBe('—')
  })
})

describe('payment presentation', () => {
  it('has a label and variant for every status', () => {
    for (const code of Object.values(PAYMENT_STATUS)) {
      expect(PAYMENT_STATUS_LABELS[code]).toBeTruthy()
      expect(PAYMENT_STATUS_VARIANTS[code]).toBeTruthy()
    }
  })
})
