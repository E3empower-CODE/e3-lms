import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, CheckCircle2 } from 'lucide-react'
import { Card } from '../../components/Card/Card'
import { Button } from '../../components/Button/Button'
import { Alert } from '../../components/Alert/Alert'
import { DataState } from '../../components/DataState/DataState'
import { useAsync } from '../../hooks/useAsync'
import {
  fetchMyAssessment,
  startAssessmentAttempt,
  submitAssessmentAttempt,
} from './courseworkApi'
import { QuestionField } from './QuestionField'
import styles from './AssessmentAttempt.module.css'

const draftKey = (assessmentId, attemptId) =>
  `e3:assessment:${assessmentId}:attempt:${attemptId}`

function loadDraft(key) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

export function AssessmentAttempt() {
  const { id } = useParams()
  const load = useCallback(() => fetchMyAssessment(id), [id])
  const { status, data: assessment, error, retry } = useAsync(load, [id])

  const [attempt, setAttempt] = useState(null) // { attempt_id, questions }
  const [answers, setAnswers] = useState({})
  const [starting, setStarting] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [actionError, setActionError] = useState(null)
  const [result, setResult] = useState(null)

  // Autosave answers per attempt (per-viewer convenience only).
  useEffect(() => {
    if (!attempt) return
    try {
      localStorage.setItem(draftKey(id, attempt.attempt_id), JSON.stringify(answers))
    } catch {
      /* storage may be unavailable; ignore */
    }
  }, [answers, attempt, id])

  async function start() {
    setStarting(true)
    setActionError(null)
    try {
      const started = await startAssessmentAttempt(id)
      setAttempt(started)
      setAnswers(loadDraft(draftKey(id, started.attempt_id)))
    } catch (err) {
      setActionError(err.message)
    } finally {
      setStarting(false)
    }
  }

  async function submit() {
    setSubmitting(true)
    setActionError(null)
    try {
      const res = await submitAssessmentAttempt(id, attempt.attempt_id, answers)
      setResult(res)
      try {
        localStorage.removeItem(draftKey(id, attempt.attempt_id))
      } catch {
        /* ignore */
      }
    } catch (err) {
      setActionError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const setAnswer = (questionId, value) =>
    setAnswers((prev) => ({ ...prev, [questionId]: value }))

  const questions = attempt?.questions ?? []

  return (
    <div>
      <Link className={styles.back} to="/student/assessments">
        <ArrowLeft className={styles.backIcon} aria-hidden="true" />
        Assessments
      </Link>

      <DataState status={status} error={error} onRetry={retry}>
        {assessment && (
          <>
            <h1 className={styles.title}>{assessment.title}</h1>

            {result ? (
              <Card className={styles.resultCard}>
                <CheckCircle2 className={styles.resultIcon} aria-hidden="true" />
                <p className={styles.resultScore}>
                  {result.score}
                  {result.max_score != null ? ` / ${result.max_score}` : ''}
                </p>
                {result.passed != null && (
                  <p className={styles.resultVerdict}>
                    {result.passed ? 'Passed' : 'Not passed'}
                  </p>
                )}
                <p className={styles.muted}>
                  Your response has been recorded. Results are final and scored by the
                  school.
                </p>
              </Card>
            ) : attempt ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  submit()
                }}
              >
                <ol className={styles.questions}>
                  {questions.map((q, i) => (
                    <li key={q.id} className={styles.question}>
                      <QuestionField
                        index={i + 1}
                        question={q}
                        value={answers[q.id]}
                        onChange={(v) => setAnswer(q.id, v)}
                      />
                    </li>
                  ))}
                </ol>
                {actionError && (
                  <Alert variant="error" className={styles.actionError}>
                    {actionError}
                  </Alert>
                )}
                <div className={styles.actions}>
                  <Button type="submit" loading={submitting}>
                    Submit answers
                  </Button>
                </div>
              </form>
            ) : (
              <Card className={styles.introCard}>
                {assessment.instructions && (
                  <p className={styles.instructions}>{assessment.instructions}</p>
                )}
                <ul className={styles.meta}>
                  {assessment.question_count != null && (
                    <li>{assessment.question_count} questions</li>
                  )}
                  {assessment.duration_minutes != null && (
                    <li>{assessment.duration_minutes} minutes</li>
                  )}
                  {assessment.pass_mark != null && (
                    <li>Pass mark: {assessment.pass_mark}%</li>
                  )}
                </ul>
                {actionError && (
                  <Alert variant="error" className={styles.actionError}>
                    {actionError}
                  </Alert>
                )}
                {assessment.available === false ? (
                  <Alert variant="info">This assessment isn’t available right now.</Alert>
                ) : (
                  <div className={styles.actions}>
                    <Button onClick={start} loading={starting}>
                      Start assessment
                    </Button>
                  </div>
                )}
              </Card>
            )}
          </>
        )}
      </DataState>
    </div>
  )
}
