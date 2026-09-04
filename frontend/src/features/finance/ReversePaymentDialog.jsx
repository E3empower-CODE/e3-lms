import { useState } from 'react'
import { Modal } from '../../components/Modal/Modal'
import { Button } from '../../components/Button/Button'
import { Textarea } from '../../components/Textarea/Textarea'
import { Alert } from '../../components/Alert/Alert'
import { reversePayment } from './financeApi'
import { formatMoney } from '../../lib/format'
import styles from './ReversePaymentDialog.module.css'

/**
 * Reverse a completed payment. The original is never edited or deleted — the
 * server records an explicit reversal with this reason and recalculates the
 * balance.
 */
export function ReversePaymentDialog({ payment, onClose, onReversed }) {
  const [reason, setReason] = useState('')
  const [reasonError, setReasonError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const close = () => {
    setReason('')
    setReasonError(null)
    setError(null)
    onClose()
  }

  async function confirm() {
    if (reason.trim().length === 0) {
      setReasonError('A reason is required to reverse a payment')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      const updated = await reversePayment(payment.id, { reason: reason.trim() })
      onReversed(updated)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal open={Boolean(payment)} onClose={close} title="Reverse payment">
      {payment && (
        <div>
          <p className={styles.prompt}>
            Reverse the {formatMoney(payment.amount)} payment
            {payment.receipt_number ? ` (${payment.receipt_number})` : ''}? The
            original record is preserved and a reversal is logged.
          </p>
          <Textarea
            label="Reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            error={reasonError}
            rows={3}
          />
          {error && <Alert variant="error" className={styles.error}>{error}</Alert>}
          <div className={styles.footer}>
            <Button variant="secondary" onClick={close} disabled={submitting}>
              Cancel
            </Button>
            <Button variant="danger" onClick={confirm} loading={submitting}>
              Reverse payment
            </Button>
          </div>
        </div>
      )}
    </Modal>
  )
}
