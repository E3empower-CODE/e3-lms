import { useCallback } from 'react'
import { Link } from 'react-router-dom'
import { ClipboardList } from 'lucide-react'
import { Badge } from '../../components/Badge/Badge'
import { DataState } from '../../components/DataState/DataState'
import { useAsync } from '../../hooks/useAsync'
import { fetchMyAssessments } from './courseworkApi'
import { attemptsRemaining } from './status'
import styles from './CourseworkList.module.css'

export function AssessmentsList() {
  const load = useCallback(() => fetchMyAssessments(), [])
  const { status, data, error, retry } = useAsync(load, [])
  const items = data ?? []

  return (
    <div>
      <h1 className={styles.title}>Assessments</h1>

      <DataState
        status={status}
        error={error}
        onRetry={retry}
        isEmpty={status === 'success' && items.length === 0}
        empty={{
          icon: ClipboardList,
          title: 'No assessments',
          description: 'Quizzes and tests from your classes will appear here.',
        }}
      >
        <ul className={styles.list}>
          {items.map((a) => {
            const remaining = attemptsRemaining(a)
            const graded = a.best_score != null
            return (
              <li key={a.id}>
                <Link className={styles.item} to={`/student/assessments/${a.id}`}>
                  <div className={styles.itemMain}>
                    <p className={styles.itemTitle}>{a.title}</p>
                    <p className={styles.muted}>
                      {a.course_name}
                      {remaining != null && <> · {remaining} attempt{remaining === 1 ? '' : 's'} left</>}
                    </p>
                  </div>
                  <div className={styles.itemMeta}>
                    {graded && (
                      <span className={styles.score}>
                        {a.best_score}
                        {a.max_score != null ? `/${a.max_score}` : ''}
                      </span>
                    )}
                    {a.available === false ? (
                      <Badge variant="neutral">Unavailable</Badge>
                    ) : graded ? (
                      <Badge variant="success">Completed</Badge>
                    ) : (
                      <Badge variant="info">Available</Badge>
                    )}
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      </DataState>
    </div>
  )
}
