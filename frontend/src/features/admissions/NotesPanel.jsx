import { useState } from 'react'
import { Textarea } from '../../components/Textarea/Textarea'
import { Button } from '../../components/Button/Button'
import { Alert } from '../../components/Alert/Alert'
import { EmptyState } from '../../components/EmptyState/EmptyState'
import { MessageSquare } from 'lucide-react'
import { addApplicationNote } from './admissionsApi'
import { formatDateTime } from '../../lib/format'
import styles from './NotesPanel.module.css'

/** Admissions notes list plus an add-note form. */
export function NotesPanel({ applicationId, notes, onAdded }) {
  const [body, setBody] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [fieldError, setFieldError] = useState(null)

  async function submit(e) {
    e.preventDefault()
    if (body.trim().length === 0) {
      setFieldError('Enter a note before saving')
      return
    }
    setSubmitting(true)
    setError(null)
    setFieldError(null)
    try {
      const note = await addApplicationNote(applicationId, body.trim())
      onAdded(note)
      setBody('')
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <form className={styles.form} onSubmit={submit} noValidate>
        <Textarea
          label="Add a note"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          error={fieldError}
          rows={3}
        />
        {error && <Alert variant="error">{error}</Alert>}
        <div className={styles.formFooter}>
          <Button type="submit" loading={submitting}>
            Save note
          </Button>
        </div>
      </form>

      {notes.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="No notes yet"
          description="Notes you add are visible to admissions staff."
        />
      ) : (
        <ul className={styles.list}>
          {notes.map((note, i) => (
            <li key={note.id ?? i} className={styles.note}>
              <p className={styles.noteBody}>{note.body}</p>
              <p className={styles.noteMeta}>
                {note.author_name ? `${note.author_name} · ` : ''}
                {formatDateTime(note.created_at)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
