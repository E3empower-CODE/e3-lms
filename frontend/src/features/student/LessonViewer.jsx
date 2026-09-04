import { useCallback, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, Download, FileText } from 'lucide-react'
import { Card } from '../../components/Card/Card'
import { Button } from '../../components/Button/Button'
import { Alert } from '../../components/Alert/Alert'
import { DataState } from '../../components/DataState/DataState'
import { useAsync } from '../../hooks/useAsync'
import { fetchMyLesson, completeMyLesson } from './meApi'
import styles from './LessonViewer.module.css'

export function LessonViewer() {
  const { id: courseId, lessonId } = useParams()
  const load = useCallback(() => fetchMyLesson(lessonId), [lessonId])
  const { status, data: lesson, error, retry, setData } = useAsync(load, [lessonId])
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(null)

  const resources = lesson?.resources ?? []
  const paragraphs = (lesson?.content || '').split(/\n{2,}/).filter(Boolean)

  async function markComplete() {
    setSaving(true)
    setSaveError(null)
    try {
      const updated = await completeMyLesson(lessonId)
      // Progress is server-authoritative; reflect the returned state.
      setData((prev) => ({ ...prev, ...updated, is_completed: true }))
    } catch (err) {
      setSaveError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <Link className={styles.back} to={`/student/courses/${courseId}`}>
        <ArrowLeft className={styles.backIcon} aria-hidden="true" />
        Back to course
      </Link>

      <DataState status={status} error={error} onRetry={retry}>
        {lesson && (
          <>
            <div className={styles.header}>
              <h1 className={styles.title}>{lesson.title || lesson.name}</h1>
              {lesson.is_completed && (
                <span className={styles.completedTag}>
                  <CheckCircle2 className={styles.tagIcon} aria-hidden="true" />
                  Completed
                </span>
              )}
            </div>

            <Card className={styles.content}>
              {paragraphs.length > 0 ? (
                paragraphs.map((p, i) => (
                  <p key={i} className={styles.paragraph}>
                    {p}
                  </p>
                ))
              ) : (
                <p className={styles.muted}>No lesson content available.</p>
              )}
            </Card>

            {resources.length > 0 && (
              <section className={styles.resources}>
                <h2 className={styles.resourcesTitle}>Resources</h2>
                <ul className={styles.resourceList}>
                  {resources.map((r) => (
                    <li key={r.id ?? r.url}>
                      <a
                        className={styles.resource}
                        href={r.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <FileText className={styles.resourceIcon} aria-hidden="true" />
                        <span className={styles.resourceName}>{r.name || r.title}</span>
                        <Download className={styles.resourceIcon} aria-hidden="true" />
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {saveError && (
              <Alert variant="error" className={styles.saveError}>
                {saveError}
              </Alert>
            )}

            {!lesson.is_completed && (
              <div className={styles.actions}>
                <Button onClick={markComplete} loading={saving}>
                  Mark as complete
                </Button>
              </div>
            )}
          </>
        )}
      </DataState>
    </div>
  )
}
