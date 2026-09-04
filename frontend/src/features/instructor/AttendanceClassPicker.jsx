import { useCallback } from 'react'
import { Link } from 'react-router-dom'
import { ClipboardCheck } from 'lucide-react'
import { DataState } from '../../components/DataState/DataState'
import { useAsync } from '../../hooks/useAsync'
import { fetchMyClasses } from './teachingApi'
import styles from './MyClasses.module.css'

/** Pick a class to take attendance for; deep-links into its class detail. */
export function AttendanceClassPicker() {
  const load = useCallback(() => fetchMyClasses(), [])
  const { status, data, error, retry } = useAsync(load, [])
  const classes = data ?? []

  return (
    <div>
      <h1 className={styles.title}>Attendance</h1>

      <DataState
        status={status}
        error={error}
        onRetry={retry}
        isEmpty={status === 'success' && classes.length === 0}
        empty={{
          icon: ClipboardCheck,
          title: 'No assigned classes',
          description: 'Attendance is taken per class; assigned classes appear here.',
        }}
      >
        <ul className={styles.grid}>
          {classes.map((c) => (
            <li key={c.id}>
              <Link className={styles.card} to={`/instructor/classes/${c.id}`}>
                <p className={styles.name}>{c.name || c.course_name}</p>
                {c.schedule_label && <p className={styles.muted}>{c.schedule_label}</p>}
                <p className={styles.count}>{c.student_count ?? 0} students</p>
              </Link>
            </li>
          ))}
        </ul>
      </DataState>
    </div>
  )
}
