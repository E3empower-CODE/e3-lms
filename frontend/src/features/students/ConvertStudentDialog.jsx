import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Modal } from '../../components/Modal/Modal'
import { Button } from '../../components/Button/Button'
import { Alert } from '../../components/Alert/Alert'
import { convertApplication } from './studentsApi'
import styles from './ConvertStudentDialog.module.css'

/**
 * Convert an approved application into a student. Handles the conflict
 * responses the server returns: an existing conversion (idempotent) and a
 * duplicate-review warning that a human can override with "Create anyway".
 */
export function ConvertStudentDialog({ open, applicationId, onClose, onConverted }) {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [result, setResult] = useState(null) // created/existing student
  const [duplicates, setDuplicates] = useState(null) // candidate list

  const reset = () => {
    setSubmitting(false)
    setError(null)
    setResult(null)
    setDuplicates(null)
  }

  const close = () => {
    reset()
    onClose()
  }

  async function convert({ force = false } = {}) {
    setSubmitting(true)
    setError(null)
    try {
      const student = await convertApplication(applicationId, { force })
      setResult(student)
      setDuplicates(null)
      onConverted?.(student)
    } catch (err) {
      if (err.status === 409 && err.code === 'ALREADY_CONVERTED') {
        // Idempotent: the application already maps to a student.
        setResult(err.details?.student || err.details || null)
        onConverted?.(err.details?.student || null)
      } else if (err.status === 409 && Array.isArray(err.details?.duplicates)) {
        setDuplicates(err.details.duplicates)
      } else {
        setError(err.message)
      }
    } finally {
      setSubmitting(false)
    }
  }

  const studentId = result?.id
  const studentNumber = result?.student_number || result?.number

  return (
    <Modal open={open} onClose={close} title="Create student">
      {result ? (
        <div>
          <Alert variant="success" title="Student created">
            {studentNumber ? (
              <p>
                Student number <strong>{studentNumber}</strong> has been assigned.
              </p>
            ) : (
              <p>The application is now linked to a student.</p>
            )}
          </Alert>
          <div className={styles.footer}>
            <Button variant="secondary" onClick={close}>
              Close
            </Button>
            {studentId && (
              <Link className={styles.linkButton} to={`/admin/students/${studentId}`}>
                View student profile
              </Link>
            )}
          </div>
        </div>
      ) : duplicates ? (
        <div>
          <Alert variant="warning" title="Possible duplicate found">
            This applicant may already exist as a student. Review the matches
            before creating a new record.
          </Alert>
          <ul className={styles.dupes}>
            {duplicates.map((d) => (
              <li key={d.id} className={styles.dupe}>
                <span>
                  <span className={styles.dupeName}>{d.name || d.full_name}</span>
                  {d.student_number && (
                    <span className={styles.muted}> · {d.student_number}</span>
                  )}
                </span>
                {d.id && (
                  <Link className={styles.viewLink} to={`/admin/students/${d.id}`}>
                    View
                  </Link>
                )}
              </li>
            ))}
          </ul>
          {error && <Alert variant="error" className={styles.error}>{error}</Alert>}
          <div className={styles.footer}>
            <Button variant="secondary" onClick={close} disabled={submitting}>
              Cancel
            </Button>
            <Button variant="danger" onClick={() => convert({ force: true })} loading={submitting}>
              Create anyway
            </Button>
          </div>
        </div>
      ) : (
        <div>
          <p className={styles.prompt}>
            This creates a student identity from the approved application and
            assigns a unique student number. This can’t be undone.
          </p>
          {error && <Alert variant="error" className={styles.error}>{error}</Alert>}
          <div className={styles.footer}>
            <Button variant="secondary" onClick={close} disabled={submitting}>
              Cancel
            </Button>
            <Button onClick={() => convert()} loading={submitting}>
              Create student
            </Button>
          </div>
        </div>
      )}
    </Modal>
  )
}
