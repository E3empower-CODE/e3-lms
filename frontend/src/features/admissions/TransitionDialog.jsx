import { useState } from 'react'
import { Modal } from '../../components/Modal/Modal'
import { Button } from '../../components/Button/Button'
import { Textarea } from '../../components/Textarea/Textarea'
import { Alert } from '../../components/Alert/Alert'
import { transitionApplication } from './admissionsApi'
import styles from './TransitionDialog.module.css'

/**
 * Confirmation dialog for a status transition. Requires a reason for
 * destructive transitions (reject/cancel). The server enforces the allowed
 * matrix regardless of what the UI offers.
 */
export function TransitionDialog({ transition, applicationId, onClose, onDone }) {
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [reasonError, setReasonError] = useState(null)

  const open = Boolean(transition)

  const close = () => {
    setReason('')
    setError(null)
    setReasonError(null)
    onClose()
  }

  async function confirm() {
    if (transition.requiresReason && reason.trim().length === 0) {
      setReasonError('A reason is required for this action')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      const updated = await transitionApplication(applicationId, transition.action, {
        reason: reason.trim() || undefined,
      })
      setReason('')
      onDone(updated)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal open={open} onClose={close} title={transition ? `${transition.label}?` : ''}>
      {transition && (
        <>
          <p className={styles.prompt}>
            Are you sure you want to <strong>{transition.label.toLowerCase()}</strong>{' '}
            this application? This is recorded in the activity history.
          </p>
          {transition.requiresReason && (
            <Textarea
              label="Reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              error={reasonError}
              rows={3}
            />
          )}
          {error && (
            <Alert variant="error" className={styles.error}>
              {error}
            </Alert>
          )}
          <div className={styles.footer}>
            <Button variant="secondary" onClick={close} disabled={submitting}>
              Cancel
            </Button>
            <Button
              variant={transition.variant === 'danger' ? 'danger' : 'primary'}
              onClick={confirm}
              loading={submitting}
            >
              {transition.label}
            </Button>
          </div>
        </>
      )}
    </Modal>
  )
}
