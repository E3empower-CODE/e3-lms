import { describe, it, expect } from 'vitest'
import { rows, pageInfo, listParams } from './pagination'

describe('collection envelope helpers', () => {
  const response = {
    data: {
      data: [{ id: 1 }, { id: 2 }],
      pagination: { page: 2, page_size: 20, total_items: 40, total_pages: 2 },
    },
  }

  it('extracts rows', () => {
    expect(rows(response)).toHaveLength(2)
    expect(rows(undefined)).toEqual([])
  })

  it('normalizes pagination to camelCase with defaults', () => {
    expect(pageInfo(response)).toEqual({
      page: 2,
      pageSize: 20,
      totalItems: 40,
      totalPages: 2,
    })
    expect(pageInfo({})).toEqual({
      page: 1,
      pageSize: 20,
      totalItems: 0,
      totalPages: 0,
    })
  })
})

describe('listParams', () => {
  it('maps to snake_case and omits empty values', () => {
    expect(listParams({ page: 1, pageSize: 20, search: 'ada', ordering: '-created_at' })).toEqual({
      page: 1,
      page_size: 20,
      search: 'ada',
      ordering: '-created_at',
    })
    expect(listParams({ search: '' })).toEqual({})
  })
})
