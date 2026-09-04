import { useCallback, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, FileText, Download } from 'lucide-react'
import { Card } from '../../components/Card/Card'
import { Badge } from '../../components/Badge/Badge'
import { Button } from '../../components/Button/Button'
import { Alert } from '../../components/Alert/Alert'
import { Textarea } from '../../components/Textarea/Textarea'
import { FileInput } from '../../components/FileInput/FileInput'
import { DataState } from '../../components/DataState/DataState'
import { useAsync } from '../../hooks/useAsync'
import { fetchMyAssignment, submitAssignment } from './courseworkApi'
import {
  ASSIGNMENT_STATUS_LABELS,
  ASSIGNMENT_STATUS_VARIANTS,
  canSubmitAssignment,
} from './status'
import { formatDateTime } from '../../lib/format'
import styles from './AssignmentDetail.module.css'

export function AssignmentDetail() {
  const { id } = useParams()
  const load = useCallback(() => fetchMyAssignment(id), [id])
  const { status, data: assignment, error, retry, setData } = useAsync(load, [id])

  const [text, setText] = useState('')
  const [file, setFile] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(null)
  const [fieldError, setFieldError] = useState(null)

  async function submit(e) {
    e.preventDefault()
    if (!text.trim() && !file) {
      setFieldError('Add a response or attach a file before submitting')
      return
    }
    setSaving(true)
    setSaveError(null)
    setFieldError(null)
    try {
      const submission = await submitAssignment(id, { text: text.trim(), file })
      setData((prev) => ({
        ...prev,
        status: submission.status || 'submitted',
        submission,
      }))
      setText('')
      setFile(null)
    } catch (err) {
      setSaveError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const submission = assignment?.submission
  const attachments = assignment?.attachments ?? []
  const showForm = assignment && canSubmitAssignment(assignment.status) && !submission

  return (
    <div>
      <Link className={styles.back} to="/student/assignments">
        <ArrowLeft className={styles.backIcon} aria-hidden="true" />
        Assignments
      </Link>

      <DataState status={status} error={error} onRetry={retry}>
        {assignment && (
          <>
            <div className={styles.header}>
              <div>
                <h1 className={styles.title}>{assignment.title}</h1>
                <p className={styles.subtitle}>
                  {assignment.course_name}
                  {assignment.due_at && <> · Due {formatDateTime(assignment.due_at)}</>}
                </p>
              </div>
              <Badge variant={ASSIGNMENT_STATUS_VARIANTS[assignment.status] || 'neutral'}>
                {ASSIGNMENT_STATUS_LABELS[assignment.status] || assignment.status}
              </Badge>
            </div>

            {assignment.description && (
              <Card className={styles.section}>
                <p className={styles.description}>{assignment.description}</p>
              </Card>
            )}

            {attachments.length > 0 && (
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Attachments</h2>
                <ul className={styles.attachments}>
                  {attachments.map((att) => (
                    <li key={att.id ?? att.url}>
                      <a className={styles.attachment} href={att.url} target="_blank" rel="noopener noreferrer">
                        <FileText className={styles.attachIcon} aria-hidden="true" />
                        <span className={styles.attachName}>{att.name || att.title}</span>
                        <Download className={styles.attachIcon} aria-hidden="true" />
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {assignment.status === 'graded' && (
              <Card className={styles.section}>
                <h2 className={styles.sectionTitle}>Result</h2>
                <p className={styles.score}>
                  {assignment.score}
                  {assignment.max_score != null ? ` / ${assignment.max_score}` : ''}
                </p>
                {assignment.feedback && <p className={styles.feedback}>{assignment.feedback}</p>}
              </Card>
            )}

            {submission && assignment.status !== 'graded' && (
              <Alert variant="success" title="Submitted">
                Your work was submitted
                {submission.submitted_at ? ` on ${formatDateTime(submission.submitted_at)}` : ''}. You’ll
                see your grade here once it’s marked.
              </Alert>
            )}

            {showForm && (
              <Card className={styles.section}>
                <h2 className={styles.sectionTitle}>Your submission</h2>
                <form className={styles.form} onSubmit={submit} noValidate>
                  <Textarea
                    label="Response"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    rows={5}
                    error={fieldError}
                  />
                  <FileInput
                    label="Attachment (optional)"
                    accept=".pdf,.doc,.docx,.txt,image/*"
                    hint="PDF, Word, text, or image."
                    value={file}
                    onChange={setFile}
                  />
                  {saveError && <Alert variant="error">{saveError}</Alert>}
                  <div className={styles.formFooter}>
                    <Button type="submit" loading={saving}>
                      Submit assignment
                    </Button>
                  </div>
                </form>
              </Card>
            )}
          </>
        )}
      </DataState>
    </div>
  )
}
