import { useCallback, useState } from 'react'
import { Award, GraduationCap } from 'lucide-react'
import { Card } from '../../components/Card/Card'
import { Button } from '../../components/Button/Button'
import { Modal } from '../../components/Modal/Modal'
import { Alert } from '../../components/Alert/Alert'
import { DataState } from '../../components/DataState/DataState'
import { useAsync } from '../../hooks/useAsync'
import {
  fetchCertificates,
  fetchEligibleEnrollments,
  issueCertificate,
} from './certificatesApi'
import { formatDate } from '../../lib/format'
import styles from './CertificatesAdmin.module.css'

export function CertificatesAdmin() {
  const loadEligible = useCallback(() => fetchEligibleEnrollments(), [])
  const loadIssued = useCallback(() => fetchCertificates({}), [])
  const eligible = useAsync(loadEligible, [])
  const issued = useAsync(loadIssued, [])

  const [pending, setPending] = useState(null) // enrollment being issued
  const [issuing, setIssuing] = useState(false)
  const [error, setError] = useState(null)

  const eligibleRows = eligible.data ?? []
  const issuedRows = issued.data?.rows ?? []

  async function confirmIssue() {
    setIssuing(true)
    setError(null)
    try {
      await issueCertificate(pending.enrollment_id ?? pending.id)
      setPending(null)
      eligible.retry()
      issued.retry()
    } catch (err) {
      setError(err.message)
    } finally {
      setIssuing(false)
    }
  }

  return (
    <div>
      <h1 className={styles.title}>Certificates</h1>

      <Card className={styles.section} title="Ready to issue">
        <DataState
          status={eligible.status}
          error={eligible.error}
          onRetry={eligible.retry}
          isEmpty={eligible.status === 'success' && eligibleRows.length === 0}
          empty={{
            icon: GraduationCap,
            title: 'Nothing to issue',
            description: 'Completed enrollments eligible for a certificate will appear here.',
          }}
        >
          <ul className={styles.list}>
            {eligibleRows.map((e) => (
              <li key={e.enrollment_id ?? e.id} className={styles.row}>
                <div>
                  <p className={styles.name}>{e.student_name}</p>
                  <p className={styles.muted}>
                    {e.course_name}
                    {e.completed_on && <> · Completed {formatDate(e.completed_on)}</>}
                  </p>
                </div>
                <Button onClick={() => setPending(e)}>Issue</Button>
              </li>
            ))}
          </ul>
        </DataState>
      </Card>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Issued certificates</h2>
        <DataState
          status={issued.status}
          error={issued.error}
          onRetry={issued.retry}
          isEmpty={issued.status === 'success' && issuedRows.length === 0}
          empty={{
            icon: Award,
            title: 'No certificates issued yet',
            description: 'Issued certificates appear here.',
          }}
        >
          <ul className={styles.list}>
            {issuedRows.map((c) => (
              <li key={c.id} className={styles.row}>
                <div>
                  <p className={styles.name}>{c.student_name}</p>
                  <p className={styles.muted}>
                    {c.course_name}
                    {c.issued_on && <> · Issued {formatDate(c.issued_on)}</>}
                  </p>
                </div>
                <span className={styles.certNumber}>{c.certificate_number}</span>
              </li>
            ))}
          </ul>
        </DataState>
      </section>

      <Modal
        open={Boolean(pending)}
        onClose={() => setPending(null)}
        title="Issue certificate"
      >
        {pending && (
          <div>
            <p className={styles.prompt}>
              Issue a certificate for <strong>{pending.student_name}</strong> —{' '}
              {pending.course_name}? This assigns a unique certificate number and
              is recorded. Issuing again is safe (idempotent).
            </p>
            {error && <Alert variant="error" className={styles.alert}>{error}</Alert>}
            <div className={styles.footer}>
              <Button variant="secondary" onClick={() => setPending(null)} disabled={issuing}>
                Cancel
              </Button>
              <Button onClick={confirmIssue} loading={issuing}>
                Issue certificate
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
