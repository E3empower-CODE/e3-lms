import { useState } from 'react'
import { Modal } from '../../components/Modal/Modal'
import { Button } from '../../components/Button/Button'
import { Input } from '../../components/Input/Input'
import { Select } from '../../components/Select/Select'
import { Textarea } from '../../components/Textarea/Textarea'
import { Alert } from '../../components/Alert/Alert'
import { Spinner } from '../../components/Spinner/Spinner'
import { fetchStudents } from '../students/studentsApi'
import { fetchStudentBalance, recordPayment } from './financeApi'
import { PAYMENT_METHODS } from './status'
import { formatMoney } from '../../lib/format'
import styles from './RecordPaymentDialog.module.css'

const today = () => new Date().toISOString().slice(0, 10)

function studentName(s) {
  return s.full_name || [s.first_name, s.last_name].filter(Boolean).join(' ') || 'Student'
}

export function RecordPaymentDialog({ open, onClose, onRecorded }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [student, setStudent] = useState(null)
  const [balance, setBalance] = useState(null)

  const [amount, setAmount] = useState('')
  const [method, setMethod] = useState('cash')
  const [reference, setReference] = useState('')
  const [notes, setNotes] = useState('')
  const [paidOn, setPaidOn] = useState(today())

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [amountError, setAmountError] = useState(null)
  const [result, setResult] = useState(null)

  function close() {
    setQuery('')
    setResults([])
    setStudent(null)
    setBalance(null)
    setAmount('')
    setReference('')
    setNotes('')
    setError(null)
    setAmountError(null)
    setResult(null)
    onClose()
  }

  async function search(e) {
    e.preventDefault()
    if (!query.trim()) return
    setSearching(true)
    setError(null)
    try {
      const { rows } = await fetchStudents({ search: query.trim() })
      setResults(rows)
    } catch (err) {
      setError(err.message)
    } finally {
      setSearching(false)
    }
  }

  async function pick(s) {
    setStudent(s)
    setBalance(null)
    try {
      setBalance(await fetchStudentBalance(s.id))
    } catch {
      setBalance(null)
    }
  }

  async function submit(e) {
    e.preventDefault()
    const num = Number(amount)
    if (!amount || Number.isNaN(num) || num <= 0) {
      setAmountError('Enter an amount greater than zero')
      return
    }
    setAmountError(null)
    setSubmitting(true)
    setError(null)
    try {
      const payment = await recordPayment({
        student_id: student.id,
        amount,
        method,
        reference: reference.trim() || undefined,
        notes: notes.trim() || undefined,
        paid_on: paidOn,
      })
      setResult(payment)
      onRecorded?.(payment)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal open={open} onClose={close} title="Record payment">
      {result ? (
        <div>
          <Alert variant="success" title="Payment recorded">
            {result.receipt_number ? (
              <p>Receipt <strong>{result.receipt_number}</strong> issued.</p>
            ) : (
              <p>The payment has been recorded.</p>
            )}
            {result.outstanding != null && (
              <p>Outstanding balance: {formatMoney(result.outstanding)}</p>
            )}
          </Alert>
          <div className={styles.footer}>
            <Button onClick={close}>Done</Button>
          </div>
        </div>
      ) : !student ? (
        <div>
          <form className={styles.searchForm} onSubmit={search} role="search">
            <Input
              label="Find student"
              placeholder="Name, email, or student number"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className={styles.searchInput}
            />
            <Button type="submit" variant="secondary" loading={searching} className={styles.searchButton}>
              Search
            </Button>
          </form>
          {error && <Alert variant="error" className={styles.alert}>{error}</Alert>}
          {searching ? (
            <Spinner label="Searching…" />
          ) : (
            <ul className={styles.results}>
              {results.map((s) => (
                <li key={s.id}>
                  <button type="button" className={styles.result} onClick={() => pick(s)}>
                    <span className={styles.resultName}>{studentName(s)}</span>
                    <span className={styles.muted}>{s.student_number || s.email}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        <form className={styles.form} onSubmit={submit} noValidate>
          <div className={styles.studentRow}>
            <div>
              <p className={styles.resultName}>{studentName(student)}</p>
              <p className={styles.muted}>{student.student_number}</p>
            </div>
            <Button type="button" variant="ghost" onClick={() => setStudent(null)}>
              Change
            </Button>
          </div>

          {balance && (
            <Alert variant="info">
              Outstanding balance: <strong>{formatMoney(balance.outstanding)}</strong>
              {balance.fee_total != null && <> of {formatMoney(balance.fee_total)}</>}
            </Alert>
          )}

          <Input
            label="Amount"
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            error={amountError}
          />
          <Select label="Method" options={PAYMENT_METHODS} value={method} onChange={(e) => setMethod(e.target.value)} />
          <Input label="Reference (optional)" value={reference} onChange={(e) => setReference(e.target.value)} />
          <Input label="Payment date" type="date" max={today()} value={paidOn} onChange={(e) => setPaidOn(e.target.value)} />
          <Textarea label="Notes (optional)" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />

          {error && <Alert variant="error">{error}</Alert>}
          <div className={styles.footer}>
            <Button type="button" variant="secondary" onClick={close} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>
              Record payment
            </Button>
          </div>
        </form>
      )}
    </Modal>
  )
}
