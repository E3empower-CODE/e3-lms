import { useCallback } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Badge } from '../../components/Badge/Badge'
import { Alert } from '../../components/Alert/Alert'
import { DataState } from '../../components/DataState/DataState'
import { EmptyState } from '../../components/EmptyState/EmptyState'
import { useAsync } from '../../hooks/useAsync'
import { fetchStudent } from './studentsApi'
import { formatDate } from '../../lib/format'
import styles from './StudentDetail.module.css'

function Row({ label, value }) {
  if (value == null || value === '') return null
  return (
    <div className={styles.row}>
      <dt className={styles.term}>{label}</dt>
      <dd className={styles.desc}>{value}</dd>
    </div>
  )
}

function studentName(s) {
  return s.full_name || [s.first_name, s.last_name].filter(Boolean).join(' ') || '—'
}

export function StudentDetail() {
  const { id } = useParams()
  const load = useCallback(() => fetchStudent(id), [id])
  const { status, data: student, error, retry } = useAsync(load, [id])

  return (
    <div>
      <Link className={styles.back} to="/admin/students">
        <ArrowLeft className={styles.backIcon} aria-hidden="true" />
        Back to students
      </Link>

      <DataState status={status} error={error} onRetry={retry}>
        {student && (
          <>
            <div className={styles.header}>
              <div>
                <h1 className={styles.title}>{studentName(student)}</h1>
                <p className={styles.subtitle}>
                  <span className={styles.number}>
                    {student.student_number || `Student ${student.id}`}
                  </span>
                  {student.is_active === false && (
                    <Badge variant="neutral">Inactive</Badge>
                  )}
                  {student.is_active === true && (
                    <Badge variant="success">Active</Badge>
                  )}
                </p>
              </div>
            </div>

            {(student.is_redacted || student.redacted) && (
              <Alert variant="info" className={styles.redaction}>
                Some identity details are hidden for your role.
              </Alert>
            )}

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Profile</h2>
              <dl className={styles.list}>
                <Row label="Email" value={student.email} />
                <Row label="Phone" value={student.phone} />
                <Row label="Birth date" value={formatDate(student.birth_date)} />
                <Row label="Gender" value={student.gender} />
                <Row label="Nationality" value={student.nationality} />
                <Row
                  label="Address"
                  value={[student.address_line, student.city, student.state_region, student.country]
                    .filter(Boolean)
                    .join(', ')}
                />
              </dl>
            </section>

            {student.application_id && (
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Origin</h2>
                <p className={styles.muted}>
                  Created from application{' '}
                  <Link className={styles.link} to={`/admin/applications/${student.application_id}`}>
                    {student.application_number || `#${student.application_id}`}
                  </Link>
                  .
                </p>
              </section>
            )}

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Enrollments</h2>
              <EmptyState
                title="No enrollments yet"
                description="Class enrollments appear here once scheduling is available (Phase 6)."
              />
            </section>
          </>
        )}
      </DataState>
    </div>
  )
}
