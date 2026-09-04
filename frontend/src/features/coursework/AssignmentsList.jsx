import { useCallback } from 'react'
import { Link } from 'react-router-dom'
import { FileText } from 'lucide-react'
import { Badge } from '../../components/Badge/Badge'
import { DataState } from '../../components/DataState/DataState'
import { useAsync } from '../../hooks/useAsync'
import { fetchMyAssignments } from './courseworkApi'
import { ASSIGNMENT_STATUS_LABELS, ASSIGNMENT_STATUS_VARIANTS } from './status'
import { formatDateTime } from '../../lib/format'
import styles from './CourseworkList.module.css'

export function AssignmentsList() {
  const load = useCallback(() => fetchMyAssignments(), [])
  const { status, data, error, retry } = useAsync(load, [])
  const items = data ?? []

  return (
    <div>
      <h1 className={styles.title}>Assignments</h1>

      <DataState
        status={status}
        error={error}
        onRetry={retry}
        isEmpty={status === 'success' && items.length === 0}
        empty={{
          icon: FileText,
          title: 'No assignments',
          description: 'Assignments from your classes will appear here.',
        }}
      >
        <ul className={styles.list}>
          {items.map((a) => (
            <li key={a.id}>
              <Link className={styles.item} to={`/student/assignments/${a.id}`}>
                <div className={styles.itemMain}>
                  <p className={styles.itemTitle}>{a.title}</p>
                  <p className={styles.muted}>
                    {a.course_name}
                    {a.due_at && <> · Due {formatDateTime(a.due_at)}</>}
                  </p>
                </div>
                <div className={styles.itemMeta}>
                  {a.status === 'graded' && a.score != null && (
                    <span className={styles.score}>
                      {a.score}
                      {a.max_score != null ? `/${a.max_score}` : ''}
                    </span>
                  )}
                  <Badge variant={ASSIGNMENT_STATUS_VARIANTS[a.status] || 'neutral'}>
                    {ASSIGNMENT_STATUS_LABELS[a.status] || a.status}
                  </Badge>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </DataState>
    </div>
  )
}
