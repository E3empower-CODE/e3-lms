import { useCallback } from 'react'
import { Link } from 'react-router-dom'
import { CalendarDays, Users } from 'lucide-react'
import { Badge } from '../../components/Badge/Badge'
import { DataState } from '../../components/DataState/DataState'
import { useAsync } from '../../hooks/useAsync'
import { fetchMyClasses } from './teachingApi'
import styles from './MyClasses.module.css'

export function MyClasses() {
  const load = useCallback(() => fetchMyClasses(), [])
  const { status, data, error, retry } = useAsync(load, [])
  const classes = data ?? []

  return (
    <div>
      <h1 className={styles.title}>My classes</h1>

      <DataState
        status={status}
        error={error}
        onRetry={retry}
        isEmpty={status === 'success' && classes.length === 0}
        empty={{
          icon: CalendarDays,
          title: 'No assigned classes',
          description: 'Classes you’re assigned to teach will appear here.',
        }}
      >
        <ul className={styles.grid}>
          {classes.map((c) => (
            <li key={c.id}>
              <Link className={styles.card} to={`/instructor/classes/${c.id}`}>
                <div className={styles.cardHead}>
                  <p className={styles.name}>{c.name || c.course_name}</p>
                  {c.status && <Badge variant="info">{c.status}</Badge>}
                </div>
                {c.schedule_label && <p className={styles.muted}>{c.schedule_label}</p>}
                <p className={styles.count}>
                  <Users className={styles.countIcon} aria-hidden="true" />
                  {c.student_count ?? 0} students
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </DataState>
    </div>
  )
}
