import { useCallback, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Search } from 'lucide-react'
import { Card } from '../../components/Card/Card'
import { Badge } from '../../components/Badge/Badge'
import { Button } from '../../components/Button/Button'
import { Select } from '../../components/Select/Select'
import { DataState } from '../../components/DataState/DataState'
import { Pagination } from '../../components/Pagination/Pagination'
import { useAsync } from '../../hooks/useAsync'
import { fetchApplications } from './admissionsApi'
import { STATUS_LABELS, STATUS_VARIANTS, STATUS_FILTER_OPTIONS } from './status'
import { formatDate } from '../../lib/format'
import styles from './ApplicationsList.module.css'

function applicantName(app) {
  return (
    app.applicant_name ||
    [app.first_name, app.last_name].filter(Boolean).join(' ') ||
    '—'
  )
}

export function ApplicationsList() {
  const [params, setParams] = useSearchParams()
  const page = Number(params.get('page') || 1)
  const search = params.get('q') || ''
  const status = params.get('status') || ''
  const [searchInput, setSearchInput] = useState(search)

  const load = useCallback(
    () => fetchApplications({ page, search, status }),
    [page, search, status],
  )
  const { status: reqStatus, data, error, retry } = useAsync(load, [page, search, status])

  const updateParams = (next) => {
    const merged = { q: search, status, page: '1', ...next }
    const clean = Object.fromEntries(
      Object.entries(merged).filter(([, v]) => v !== '' && v != null),
    )
    setParams(clean)
  }

  const onSearchSubmit = (e) => {
    e.preventDefault()
    updateParams({ q: searchInput, page: '1' })
  }

  const rows = data?.rows ?? []
  const pagination = data?.pagination ?? {}

  return (
    <div>
      <h1 className={styles.title}>Applications</h1>

      <Card className={styles.filters}>
        <form className={styles.searchForm} onSubmit={onSearchSubmit} role="search">
          <div className={styles.searchField}>
            <label htmlFor="app-search" className={styles.srOnly}>
              Search applications
            </label>
            <Search className={styles.searchIcon} aria-hidden="true" />
            <input
              id="app-search"
              className={styles.searchInput}
              type="search"
              placeholder="Search by name, email, or number"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
          <Button type="submit" variant="secondary">
            Search
          </Button>
        </form>
        <Select
          label=""
          aria-label="Filter by status"
          className={styles.statusFilter}
          options={STATUS_FILTER_OPTIONS}
          value={status}
          onChange={(e) => updateParams({ status: e.target.value, page: '1' })}
        />
      </Card>

      <DataState
        status={reqStatus}
        error={error}
        onRetry={retry}
        isEmpty={reqStatus === 'success' && rows.length === 0}
        empty={{
          title: 'No applications found',
          description: 'Try adjusting your search or status filter.',
        }}
      >
        {/* Desktop table */}
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th scope="col">Number</th>
                <th scope="col">Applicant</th>
                <th scope="col">Email</th>
                <th scope="col">Status</th>
                <th scope="col">Submitted</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((app) => (
                <tr key={app.id}>
                  <td>
                    <Link className={styles.link} to={`/admin/applications/${app.id}`}>
                      {app.application_number || app.id}
                    </Link>
                  </td>
                  <td>{applicantName(app)}</td>
                  <td className={styles.muted}>{app.email || '—'}</td>
                  <td>
                    <Badge variant={STATUS_VARIANTS[app.status] || 'neutral'}>
                      {STATUS_LABELS[app.status] || app.status}
                    </Badge>
                  </td>
                  <td className={styles.muted}>{formatDate(app.created_at?.slice(0, 10))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <ul className={styles.cards}>
          {rows.map((app) => (
            <li key={app.id}>
              <Link className={styles.card} to={`/admin/applications/${app.id}`}>
                <div className={styles.cardTop}>
                  <span className={styles.cardNumber}>
                    {app.application_number || app.id}
                  </span>
                  <Badge variant={STATUS_VARIANTS[app.status] || 'neutral'}>
                    {STATUS_LABELS[app.status] || app.status}
                  </Badge>
                </div>
                <p className={styles.cardName}>{applicantName(app)}</p>
                <p className={styles.muted}>{app.email || '—'}</p>
              </Link>
            </li>
          ))}
        </ul>

        <Pagination
          page={pagination.page || 1}
          totalPages={pagination.totalPages || 1}
          onChange={(p) => updateParams({ page: String(p) })}
        />
      </DataState>
    </div>
  )
}
