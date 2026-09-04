import { useCallback, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Printer, UserPlus } from 'lucide-react'
import { Badge } from '../../components/Badge/Badge'
import { Button } from '../../components/Button/Button'
import { Tabs } from '../../components/Tabs/Tabs'
import { DataState } from '../../components/DataState/DataState'
import { useAsync } from '../../hooks/useAsync'
import { useAuth } from '../auth/AuthContext'
import { canConvertApplications } from '../../lib/roles'
import { fetchApplication } from './admissionsApi'
import { STATUS, STATUS_LABELS, STATUS_VARIANTS, transitionsFor } from './status'
import { TransitionDialog } from './TransitionDialog'
import { NotesPanel } from './NotesPanel'
import { ConvertStudentDialog } from '../students/ConvertStudentDialog'
import { formatDate, formatDateTime, formatMoney } from '../../lib/format'
import styles from './ApplicationDetail.module.css'

function Row({ label, value }) {
  if (value == null || value === '') return null
  return (
    <div className={styles.row}>
      <dt className={styles.term}>{label}</dt>
      <dd className={styles.desc}>{value}</dd>
    </div>
  )
}

function applicantName(app) {
  return (
    app.applicant_name ||
    [app.first_name, app.last_name].filter(Boolean).join(' ') ||
    '—'
  )
}

export function ApplicationDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const load = useCallback(() => fetchApplication(id), [id])
  const { status, data, error, retry, setData } = useAsync(load, [id])
  const [pending, setPending] = useState(null) // active transition
  const [convertOpen, setConvertOpen] = useState(false)

  const app = data
  const courses = app?.courses ?? []
  const notes = app?.notes ?? []
  const activity = app?.activity ?? []
  const transitions = app ? transitionsFor(app.status) : []
  const canConvert =
    app?.status === STATUS.APPROVED &&
    !app?.student_id &&
    canConvertApplications(user?.role)

  const overview = app && (
    <div className={styles.sections}>
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Applicant</h3>
        <dl className={styles.list}>
          <Row label="Name" value={applicantName(app)} />
          <Row label="Birth date" value={formatDate(app.birth_date)} />
          <Row label="Email" value={app.email} />
          <Row label="Phone" value={app.phone} />
          <Row
            label="Address"
            value={[app.address_line, app.city, app.state_region, app.country]
              .filter(Boolean)
              .join(', ')}
          />
        </dl>
      </section>
      {app.guardian_full_name && (
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Guardian</h3>
          <dl className={styles.list}>
            <Row label="Name" value={app.guardian_full_name} />
            <Row label="Relationship" value={app.guardian_relationship} />
            <Row label="Phone" value={app.guardian_phone} />
          </dl>
        </section>
      )}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Emergency contact</h3>
        <dl className={styles.list}>
          <Row label="Name" value={app.emergency_name} />
          <Row label="Relationship" value={app.emergency_relationship} />
          <Row label="Phone" value={app.emergency_phone} />
        </dl>
      </section>
    </div>
  )

  const coursesPanel = (
    <dl className={styles.list}>
      {courses.length === 0 && <p className={styles.muted}>No courses recorded.</p>}
      {courses.map((c) => (
        <Row key={c.id ?? c.name} label={c.name} value={formatMoney(c.fee_at_registration ?? c.fee)} />
      ))}
    </dl>
  )

  const activityPanel = (
    <ol className={styles.activity}>
      {activity.length === 0 && <p className={styles.muted}>No activity yet.</p>}
      {activity.map((entry, i) => (
        <li key={entry.id ?? i} className={styles.activityItem}>
          <span className={styles.activityDot} aria-hidden="true" />
          <div>
            <p className={styles.activityText}>{entry.description || entry.action}</p>
            <p className={styles.muted}>{formatDateTime(entry.created_at)}</p>
          </div>
        </li>
      ))}
    </ol>
  )

  return (
    <div>
      <Link className={`${styles.back} no-print`} to="/admin/applications">
        <ArrowLeft className={styles.backIcon} aria-hidden="true" />
        Back to applications
      </Link>

      <DataState status={status} error={error} onRetry={retry}>
        {app && (
          <>
            <div className={`${styles.header} no-print`}>
              <div>
                <h1 className={styles.title}>
                  {app.application_number || `Application ${app.id}`}
                </h1>
                <p className={styles.subtitle}>
                  {applicantName(app)} ·{' '}
                  <Badge variant={STATUS_VARIANTS[app.status] || 'neutral'}>
                    {STATUS_LABELS[app.status] || app.status}
                  </Badge>
                </p>
              </div>
              <Button variant="secondary" onClick={() => window.print()}>
                <Printer className={styles.backIcon} aria-hidden="true" />
                Print
              </Button>
            </div>

            {(canConvert || app.student_id) && (
              <div className={`${styles.actions} no-print`}>
                {app.student_id ? (
                  <Link className={styles.studentLink} to={`/admin/students/${app.student_id}`}>
                    <UserPlus className={styles.backIcon} aria-hidden="true" />
                    View linked student
                  </Link>
                ) : (
                  <Button onClick={() => setConvertOpen(true)}>
                    <UserPlus className={styles.backIcon} aria-hidden="true" />
                    Create student
                  </Button>
                )}
              </div>
            )}

            {transitions.length > 0 && (
              <div className={`${styles.actions} no-print`}>
                {transitions.map((t) => (
                  <Button key={t.action} variant={t.variant} onClick={() => setPending(t)}>
                    {t.label}
                  </Button>
                ))}
              </div>
            )}

            <div className="no-print">
              <Tabs
                tabs={[
                  { key: 'overview', label: 'Overview', content: overview },
                  { key: 'courses', label: 'Courses', content: coursesPanel },
                  {
                    key: 'notes',
                    label: 'Notes',
                    content: (
                      <NotesPanel
                        applicationId={app.id}
                        notes={notes}
                        onAdded={(note) =>
                          setData((prev) => ({
                            ...prev,
                            notes: [note, ...(prev.notes ?? [])],
                          }))
                        }
                      />
                    ),
                  },
                  { key: 'activity', label: 'Activity', content: activityPanel },
                ]}
              />
            </div>

            {/* Print-only clean summary */}
            <div className="print-only">
              <h1 className={styles.title}>
                {app.application_number || `Application ${app.id}`}
              </h1>
              <p className={styles.subtitle}>
                {applicantName(app)} — {STATUS_LABELS[app.status] || app.status}
              </p>
              {overview}
              <section className={styles.section}>
                <h3 className={styles.sectionTitle}>Courses</h3>
                {coursesPanel}
              </section>
            </div>

            <TransitionDialog
              transition={pending}
              onClose={() => setPending(null)}
              applicationId={app.id}
              onDone={(updated) => {
                setData((prev) => ({ ...prev, ...updated }))
                setPending(null)
              }}
            />

            <ConvertStudentDialog
              open={convertOpen}
              applicationId={app.id}
              onClose={() => setConvertOpen(false)}
              onConverted={(student) =>
                setData((prev) => ({
                  ...prev,
                  student_id: student?.id ?? prev.student_id,
                  student_number: student?.student_number ?? prev.student_number,
                }))
              }
            />
          </>
        )}
      </DataState>
    </div>
  )
}
