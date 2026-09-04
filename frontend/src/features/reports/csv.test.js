import { describe, it, expect } from 'vitest'
import { toCsv } from './csv'

const columns = [
  { key: 'name', label: 'Name' },
  { key: 'total', label: 'Total' },
]

describe('toCsv', () => {
  it('builds a header and quoted rows joined by CRLF', () => {
    const csv = toCsv(columns, [{ name: 'Ada', total: 3 }])
    expect(csv).toBe('"Name","Total"\r\n"Ada","3"')
  })

  it('returns only the header when there are no rows', () => {
    expect(toCsv(columns, [])).toBe('"Name","Total"')
  })

  it('neutralizes formula-injection leads with a quote prefix', () => {
    const csv = toCsv(columns, [{ name: '=cmd()', total: '+1' }])
    expect(csv).toContain('"\'=cmd()"')
    expect(csv).toContain('"\'+1"')
  })

  it('escapes embedded double quotes', () => {
    const csv = toCsv(columns, [{ name: 'a"b', total: 1 }])
    expect(csv).toContain('"a""b"')
  })

  it('renders null/undefined cells as empty strings', () => {
    const csv = toCsv(columns, [{ name: null, total: undefined }])
    expect(csv).toBe('"Name","Total"\r\n"",""')
  })
})
