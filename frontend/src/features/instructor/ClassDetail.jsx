import { useCallback } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Users } from 'lucide-react'
import { Tabs } from '../../components/Tabs/Tabs'
import { ProgressBar } from '../../components/ProgressBar/ProgressBar'
import { DataState } from '../../components/DataState/DataState'
import { EmptyState } from '../../components/EmptyState/EmptyState'
import { PlaceholderPage } from '../../components/PlaceholderPage/PlaceholderPage'
import { useAsync } from '../../hooks/useAsync'
import { fetchMyClass } from './teachingApi'
import { ClassCoursework } from './ClassCoursework'
import { AttendanceTab } from './AttendanceTab'
import styles from './ClassDetail.module.css'

function studentName(s) {
  return s.name || s.full_name || [s.first_name, s.last_name].filter(Boolean).join(' ') || '—'
}

export function ClassDetail() {
  const { id } = useParams()
  const load = useCallback(() => fetchMyClass(id), [id])
  const { status, data: klass, error, retry } = useAsync(load, [id])

  const roster = klass?.roster ?? klass?.students ?? []

  const rosterPanel =
    roster.length === 0 ? (
      <EmptyState
        icon={Users}
        title="No students enrolled"
        description="Students enrolled in this class will appear here."
      />
    ) : (
      <>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th scope="col">Student</th>
                <th scope="col">Number</th>
                <th scope="col">Progress</th>
              </tr>
            </thead>
            <tbody>
              {roster.map((s) => (
                <tr key={s.id}>
                  <td>{studentName(s)}</td>
                  <td className={styles.muted}>{s.student_number || '—'}</td>
                  <td className={styles.progressCell}>
                    <ProgressBar value={s.progress_percent ?? 0} showValue />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <ul className={styles.cards}>
          {roster.map((s) => (
            <li key={s.id} className={styles.card}>
              <p className={styles.cardName}>{studentName(s)}</p>
              <p className={styles.muted}>{s.student_number || '—'}</p>
              <ProgressBar value={s.progress_percent ?? 0} label="Progress" />
            </li>
          ))}
        </ul>
      </>
    )

  return (
    <div>
      <Link className={styles.back} to="/instructor/classes">
        <ArrowLeft className={styles.backIcon} aria-hidden="true" />
        My classes
      </Link>

      <DataState status={status} error={error} onRetry={retry}>
        {klass && (
          <>
            <div className={styles.header}>
              <h1 className={styles.title}>{klass.name || klass.course_name}</h1>
              <p className={styles.subtitle}>
                {klass.schedule_label && <span>{klass.schedule_label} · </span>}
                {roster.length} students
              </p>
            </div>

            <Tabs
              tabs={[
                { key: 'roster', label: 'Roster', content: rosterPanel },
                {
                  key: 'lessons',
                  label: 'Lessons',
                  content: (
                    <PlaceholderPage
                      title="Lessons"
                      phase="Phase 7"
                      description="Publishing and managing lesson content arrives with the coursework phase."
                    />
                  ),
                },
                {
                  key: 'attendance',
                  label: 'Attendance',
                  content: <AttendanceTab classId={id} />,
                },
                {
                  key: 'coursework',
                  label: 'Coursework',
                  content: <ClassCoursework classId={id} />,
                },
              ]}
            />
          </>
        )}
      </DataState>
    </div>
  )
}
