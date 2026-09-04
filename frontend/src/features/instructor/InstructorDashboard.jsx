import { useCallback } from 'react'
import { Link } from 'react-router-dom'
import { CalendarDays, Users, ClipboardCheck, FileEdit } from 'lucide-react'
import { StatCard } from '../../components/StatCard/StatCard'
import { DataState } from '../../components/DataState/DataState'
import { EmptyState } from '../../components/EmptyState/EmptyState'
import { useAsync } from '../../hooks/useAsync'
import { useAuth } from '../auth/AuthContext'
import { fetchInstructorDashboard } from './teachingApi'
import { formatDateTime } from '../../lib/format'
import styles from './InstructorDashboard.module.css'

export function InstructorDashboard() {
  const { user } = useAuth()
  const load = useCallback(() => fetchInstructorDashboard(), [])
  const { status, data, error, retry } = useAsync(load, [])

  const upcoming = data?.upcoming_sessions ?? []
  const pending = data?.pending ?? {}

  return (
    <div>
      <h1 className={styles.title}>
        Good to see you{user?.name ? `, ${user.name}` : ''}
      </h1>

      <DataState status={status} error={error} onRetry={retry}>
        <div className={styles.stats}>
          <StatCard label="Assigned classes" value={data?.assigned_classes ?? 0} icon={CalendarDays} />
          <StatCard label="Students" value={data?.total_students ?? 0} icon={Users} />
          <StatCard
            label="Attendance to take"
            value={pending.attendance ?? 0}
            icon={ClipboardCheck}
          />
          <StatCard label="Work to grade" value={pending.grading ?? 0} icon={FileEdit} />
        </div>

        <div className={styles.sectionHead}>
          <h2 className={styles.sectionTitle}>Upcoming sessions</h2>
          <Link className={styles.viewAll} to="/instructor/classes">
            My classes
          </Link>
        </div>

        {upcoming.length === 0 ? (
          <EmptyState
            icon={CalendarDays}
            title="No upcoming sessions"
            description="Scheduled sessions for your classes will appear here."
          />
        ) : (
          <ul className={styles.sessions}>
            {upcoming.map((s) => (
              <li key={s.id}>
                <Link className={styles.session} to={`/instructor/classes/${s.class_id}`}>
                  <div>
                    <p className={styles.sessionClass}>{s.class_name || s.course_name}</p>
                    <p className={styles.muted}>{formatDateTime(s.starts_at)}</p>
                  </div>
                  {s.session_label && (
                    <span className={styles.sessionLabel}>{s.session_label}</span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </DataState>
    </div>
  )
}
