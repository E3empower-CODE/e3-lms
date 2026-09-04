import { useCallback } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, FileText, Download } from 'lucide-react'
import { Card } from '../../components/Card/Card'
import { Badge } from '../../components/Badge/Badge'
import { DataState } from '../../components/DataState/DataState'
import { useAsync } from '../../hooks/useAsync'
import { fetchAssignmentSubmissions, gradeSubmission } from './teachingCourseworkApi'
import { GradeForm } from './GradeForm'
import { formatDateTime } from '../../lib/format'
import styles from './Grading.module.css'

function studentName(s) {
  return s.student_name || s.name || [s.first_name, s.last_name].filter(Boolean).join(' ') || '—'
}

export function AssignmentGrading() {
  const { id } = useParams()
  const load = useCallback(() => fetchAssignmentSubmissions(id), [id])
  const { status, data, error, retry, setData } = useAsync(load, [id])
  const submissions = data ?? []

  const applyGrade = (submissionId) => async ({ score, feedback }) => {
    const updated = await gradeSubmission(submissionId, { score, feedback })
    setData((prev) =>
      (prev ?? []).map((s) =>
        s.id === submissionId
          ? { ...s, ...updated, status: updated.status || 'graded', score, feedback }
          : s,
      ),
    )
  }

  return (
    <div>
      <Link className={styles.back} to="/instructor/classes">
        <ArrowLeft className={styles.backIcon} aria-hidden="true" />
        My classes
      </Link>

      <h1 className={styles.title}>Grade submissions</h1>

      <DataState
        status={status}
        error={error}
        onRetry={retry}
        isEmpty={status === 'success' && submissions.length === 0}
        empty={{
          icon: FileText,
          title: 'No submissions yet',
          description: 'Submissions from students will appear here to grade.',
        }}
      >
        <ul className={styles.list}>
          {submissions.map((s) => (
            <li key={s.id}>
              <Card className={styles.card}>
                <div className={styles.cardHead}>
                  <div>
                    <p className={styles.name}>{studentName(s)}</p>
                    {s.submitted_at && (
                      <p className={styles.muted}>Submitted {formatDateTime(s.submitted_at)}</p>
                    )}
                  </div>
                  <Badge variant={s.status === 'graded' ? 'success' : 'warning'}>
                    {s.status === 'graded' ? 'Graded' : 'Needs grading'}
                  </Badge>
                </div>

                {s.text && <p className={styles.response}>{s.text}</p>}
                {s.file_url && (
                  <a className={styles.file} href={s.file_url} target="_blank" rel="noopener noreferrer">
                    <FileText className={styles.fileIcon} aria-hidden="true" />
                    {s.file_name || 'Attachment'}
                    <Download className={styles.fileIcon} aria-hidden="true" />
                  </a>
                )}

                <GradeForm
                  maxScore={s.max_score}
                  initialScore={s.score ?? ''}
                  initialFeedback={s.feedback ?? ''}
                  onSave={applyGrade(s.id)}
                />
              </Card>
            </li>
          ))}
        </ul>
      </DataState>
    </div>
  )
}
