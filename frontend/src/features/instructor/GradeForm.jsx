import { useState } from 'react'
import { Input } from '../../components/Input/Input'
import { Textarea } from '../../components/Textarea/Textarea'
import { Button } from '../../components/Button/Button'
import { Alert } from '../../components/Alert/Alert'
import { validateScore } from './grading'
import styles from './GradeForm.module.css'

/**
 * Score + feedback entry, shared by assignment and assessment grading.
 * @param {number} [maxScore]
 * @param {(payload: {score:number, feedback:string}) => Promise<void>} onSave
 */
export function GradeForm({ maxScore, initialScore = '', initialFeedback = '', onSave }) {
  const [score, setScore] = useState(initialScore === null ? '' : String(initialScore))
  const [feedback, setFeedback] = useState(initialFeedback || '')
  const [scoreError, setScoreError] = useState(null)
  const [saveError, setSaveError] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function submit(e) {
    e.preventDefault()
    const err = validateScore(score, maxScore)
    setScoreError(err)
    if (err) return
    setSaving(true)
    setSaveError(null)
    setSaved(false)
    try {
      await onSave({ score: Number(score), feedback: feedback.trim() })
      setSaved(true)
    } catch (ex) {
      setSaveError(ex.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form className={styles.form} onSubmit={submit} noValidate>
      <div className={styles.scoreRow}>
        <Input
          label={maxScore != null ? `Score (out of ${maxScore})` : 'Score'}
          type="number"
          inputMode="numeric"
          min={0}
          max={maxScore}
          className={styles.scoreInput}
          value={score}
          onChange={(e) => {
            setScore(e.target.value)
            setSaved(false)
          }}
          error={scoreError}
        />
        <Button type="submit" loading={saving} className={styles.saveButton}>
          Save grade
        </Button>
      </div>
      <Textarea
        label="Feedback (optional)"
        rows={2}
        value={feedback}
        onChange={(e) => {
          setFeedback(e.target.value)
          setSaved(false)
        }}
      />
      {saveError && <Alert variant="error">{saveError}</Alert>}
      {saved && <Alert variant="success">Grade saved.</Alert>}
    </form>
  )
}
