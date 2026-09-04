import { useCallback } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ClipboardList } from 'lucide-react'
import { Card } from '../../components/Card/Card'
import { Badge } from '../../components/Badge/Badge'
import { DataState } from '../../components/DataState/DataState'
import { useAsync } from '../../hooks/useAsync'
import { fetchAssessmentResults, gradeAttempt } from './teachingCourseworkApi'
import { GradeForm } from './GradeForm'
import { formatDateTime } from '../../lib/format'
import styles from './Grading.module.css'

function studentName(s) {
  return s.student_name || s.name || [s.first_name, s.last_name].filter(Boolean).join(' ') || '—'
}

export function AssessmentResults() {
  const { id } = useParams()
  const load = useCallback(() => fetchAssessmentResults(id), [id])
  const { status, data, error, retry, setData } = useAsync(load, [id])
  const attempts = data ?? []

  const applyGrade = (attemptId) => async ({ score, feedback }) => {
    const updated = await gradeAttempt(attemptId, { score, feedback })
    setData((prev) =>
      (prev ?? []).map((a) =>
        a.id === attemptId
          ? { ...a, ...updated, needs_review: false, score, feedback }
          : a,
      ),
    )
  }

  return (
    <div>
      <Link className={styles.back} to="/instructor/classes">
        <ArrowLeft className={styles.backIcon} aria-hidden="true" />
        My classes
      </Link>

      <h1 className={styles.title}>Assessment results</h1>

      <DataState
        status={status}
        error={error}
        onRetry={retry}
        isEmpty={status === 'success' && attempts.length === 0}
        empty={{
          icon: ClipboardList,
          title: 'No attempts yet',
          description: 'Student attempts will appear here.',
        }}
      >
        <ul className={styles.list}>
          {attempts.map((a) => (
            <li key={a.id}>
              <Card className={styles.card}>
                <div className={styles.cardHead}>
                  <div>
                    <p className={styles.name}>{studentName(a)}</p>
                    {a.submitted_at && (
                      <p className={styles.muted}>Submitted {formatDateTime(a.submitted_at)}</p>
                    )}
                  </div>
                  <div className={styles.scoreArea}>
                    {a.score != null && (
                      <span className={styles.score}>
                        {a.score}
                        {a.max_score != null ? `/${a.max_score}` : ''}
                      </span>
                    )}
                    {a.needs_review ? (
                      <Badge variant="warning">Needs review</Badge>
                    ) : (
                      <Badge variant="success">Scored</Badge>
                    )}
                  </div>
                </div>

                {a.needs_review && (
                  <GradeForm
                    maxScore={a.max_score}
                    initialScore={a.score ?? ''}
                    initialFeedback={a.feedback ?? ''}
                    onSave={applyGrade(a.id)}
                  />
                )}
              </Card>
            </li>
          ))}
        </ul>
      </DataState>
    </div>
  )
}
