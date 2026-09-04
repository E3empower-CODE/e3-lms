import { useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Badge } from '../../components/Badge/Badge'
import { DataState } from '../../components/DataState/DataState'
import { useAsync } from '../../hooks/useAsync'
import { fetchClassCoursework } from './teachingCourseworkApi'
import { formatDateTime } from '../../lib/format'
import styles from './ClassCoursework.module.css'

export function ClassCoursework({ classId }) {
  const load = useCallback(() => fetchClassCoursework(classId), [classId])
  const { status, data, error, retry } = useAsync(load, [classId])

  const assignments = data?.assignments ?? []
  const assessments = data?.assessments ?? []
  const isEmpty =
    status === 'success' && assignments.length === 0 && assessments.length === 0

  return (
    <DataState
      status={status}
      error={error}
      onRetry={retry}
      isEmpty={isEmpty}
      empty={{
        title: 'No coursework yet',
        description: 'Assignments and assessments for this class will appear here.',
      }}
    >
      {assignments.length > 0 && (
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Assignments</h3>
          <ul className={styles.list}>
            {assignments.map((a) => (
              <li key={a.id}>
                <Link className={styles.item} to={`/instructor/assignments/${a.id}/grade`}>
                  <div>
                    <p className={styles.itemTitle}>{a.title}</p>
                    <p className={styles.muted}>
                      {a.due_at ? `Due ${formatDateTime(a.due_at)}` : 'No due date'}
                    </p>
                  </div>
                  {a.ungraded_count > 0 ? (
                    <Badge variant="warning">{a.ungraded_count} to grade</Badge>
                  ) : (
                    <Badge variant="neutral">
                      {a.submission_count ?? 0} submitted
                    </Badge>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {assessments.length > 0 && (
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Assessments</h3>
          <ul className={styles.list}>
            {assessments.map((a) => (
              <li key={a.id}>
                <Link className={styles.item} to={`/instructor/assessments/${a.id}/results`}>
                  <div>
                    <p className={styles.itemTitle}>{a.title}</p>
                    <p className={styles.muted}>{a.attempt_count ?? 0} attempts</p>
                  </div>
                  {a.needs_review_count > 0 ? (
                    <Badge variant="warning">{a.needs_review_count} to review</Badge>
                  ) : (
                    <Badge variant="neutral">Results</Badge>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </DataState>
  )
}
