import { useCallback } from 'react'
import { Award, Download, Clock } from 'lucide-react'
import { DataState } from '../../components/DataState/DataState'
import { useAsync } from '../../hooks/useAsync'
import { fetchMyCertificates } from '../certificates/certificatesApi'
import { formatDate } from '../../lib/format'
import styles from './StudentCertificates.module.css'

export function StudentCertificates() {
  const load = useCallback(() => fetchMyCertificates(), [])
  const { status, data, error, retry } = useAsync(load, [])
  const certificates = data ?? []

  return (
    <div>
      <h1 className={styles.title}>Certificates</h1>

      <DataState
        status={status}
        error={error}
        onRetry={retry}
        isEmpty={status === 'success' && certificates.length === 0}
        empty={{
          icon: Award,
          title: 'No certificates yet',
          description: 'When you complete a course, your certificate appears here.',
        }}
      >
        <ul className={styles.grid}>
          {certificates.map((c) => (
            <li key={c.id} className={styles.card}>
              <Award className={styles.icon} aria-hidden="true" />
              <p className={styles.course}>{c.course_name}</p>
              <p className={styles.number}>{c.certificate_number}</p>
              {c.issued_on && (
                <p className={styles.muted}>Issued {formatDate(c.issued_on)}</p>
              )}
              {c.pdf_url ? (
                <a
                  className={styles.download}
                  href={c.pdf_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Download className={styles.downloadIcon} aria-hidden="true" />
                  Download
                </a>
              ) : (
                <p className={styles.preparing}>
                  <Clock className={styles.downloadIcon} aria-hidden="true" />
                  Being prepared
                </p>
              )}
            </li>
          ))}
        </ul>
      </DataState>
    </div>
  )
}
