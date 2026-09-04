import { describe, it, expect } from 'vitest'
import { formatMoney, formatDate } from './format'

describe('formatMoney', () => {
  it('shows a dash for empty values', () => {
    expect(formatMoney(null)).toBe('—')
    expect(formatMoney('')).toBe('—')
    expect(formatMoney(undefined)).toBe('—')
  })

  it('formats numeric strings and numbers with grouping', () => {
    expect(formatMoney(1000)).toContain('1,000')
    expect(formatMoney('2500.5')).toContain('2,500.5')
  })

  it('passes through non-numeric input rather than showing NaN', () => {
    expect(formatMoney('n/a')).toBe('n/a')
  })
})

describe('formatDate', () => {
  it('shows a dash for empty and echoes invalid input', () => {
    expect(formatDate('')).toBe('—')
    expect(formatDate('not-a-date')).toBe('not-a-date')
  })

  it('formats a YYYY-MM-DD date', () => {
    expect(formatDate('2026-09-04')).toMatch(/2026/)
  })
})
