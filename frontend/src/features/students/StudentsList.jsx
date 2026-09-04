import { useCallback, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Search } from 'lucide-react'
import { Card } from '../../components/Card/Card'
import { Button } from '../../components/Button/Button'
import { DataState } from '../../components/DataState/DataState'
import { Pagination } from '../../components/Pagination/Pagination'
import { useAsync } from '../../hooks/useAsync'
import { fetchStudents } from './studentsApi'
import styles from './StudentsList.module.css'

function studentName(s) {
  return (
    s.full_name ||
    [s.first_name, s.last_name].filter(Boolean).join(' ') ||
    '—'
  )
}

export function StudentsList() {
  const [params, setParams] = useSearchParams()
  const page = Number(params.get('page') || 1)
  const search = params.get('q') || ''
  const [searchInput, setSearchInput] = useState(search)

  const load = useCallback(() => fetchStudents({ page, search }), [page, search])
  const { status, data, error, retry } = useAsync(load, [page, search])

  const setQuery = (next) => {
    const merged = { q: search, page: '1', ...next }
    const clean = Object.fromEntries(
      Object.entries(merged).filter(([, v]) => v !== '' && v != null),
    )
    setParams(clean)
  }

  const rows = data?.rows ?? []
  const pagination = data?.pagination ?? {}

  return (
    <div>
      <h1 className={styles.title}>Students</h1>

      <Card className={styles.filters}>
        <form
          className={styles.searchForm}
          role="search"
          onSubmit={(e) => {
            e.preventDefault()
            setQuery({ q: searchInput, page: '1' })
          }}
        >
          <div className={styles.searchField}>
            <label htmlFor="student-search" className={styles.srOnly}>
              Search students
            </label>
            <Search className={styles.searchIcon} aria-hidden="true" />
            <input
              id="student-search"
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
      </Card>

      <DataState
        status={status}
        error={error}
        onRetry={retry}
        isEmpty={status === 'success' && rows.length === 0}
        empty={{
          title: 'No students found',
          description: 'Students appear here once approved applications are converted.',
        }}
      >
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th scope="col">Student number</th>
                <th scope="col">Name</th>
                <th scope="col">Email</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((s) => (
                <tr key={s.id}>
                  <td>
                    <Link className={styles.link} to={`/admin/students/${s.id}`}>
                      {s.student_number || s.id}
                    </Link>
                  </td>
                  <td>{studentName(s)}</td>
                  <td className={styles.muted}>{s.email || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <ul className={styles.cards}>
          {rows.map((s) => (
            <li key={s.id}>
              <Link className={styles.card} to={`/admin/students/${s.id}`}>
                <span className={styles.cardNumber}>{s.student_number || s.id}</span>
                <p className={styles.cardName}>{studentName(s)}</p>
                <p className={styles.muted}>{s.email || '—'}</p>
              </Link>
            </li>
          ))}
        </ul>

        <Pagination
          page={pagination.page || 1}
          totalPages={pagination.totalPages || 1}
          onChange={(p) => setQuery({ page: String(p) })}
        />
      </DataState>
    </div>
  )
}
