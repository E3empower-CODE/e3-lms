/**
 * Helpers for the collection envelope:
 *   { data: [...], pagination: { page, page_size, total_items, total_pages } }
 */

/** Extract the rows from a collection response. */
export function rows(response) {
  return response?.data?.data ?? []
}

/** Extract normalized pagination metadata from a collection response. */
export function pageInfo(response) {
  const p = response?.data?.pagination ?? {}
  return {
    page: p.page ?? 1,
    pageSize: p.page_size ?? 20,
    totalItems: p.total_items ?? 0,
    totalPages: p.total_pages ?? 0,
  }
}

/** Build a `snake_case` query-params object for list endpoints. */
export function listParams({ page, pageSize, search, ordering, ...rest } = {}) {
  const params = { ...rest }
  if (page != null) params.page = page
  if (pageSize != null) params.page_size = pageSize
  if (search) params.search = search
  if (ordering) params.ordering = ordering
  return params
}
