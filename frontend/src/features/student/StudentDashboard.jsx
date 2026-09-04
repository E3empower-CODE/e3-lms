import { useCallback } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, GraduationCap, CalendarCheck, Wallet, ArrowRight } from 'lucide-react'
import { StatCard } from '../../components/StatCard/StatCard'
import { Card } from '../../components/Card/Card'
import { ProgressBar } from '../../components/ProgressBar/ProgressBar'
import { DataState } from '../../components/DataState/DataState'
import { EmptyState } from '../../components/EmptyState/EmptyState'
import { useAsync } from '../../hooks/useAsync'
import { useAuth } from '../auth/AuthContext'
import { fetchStudentDashboard } from './meApi'
import { formatMoney } from '../../lib/format'
import styles from './StudentDashboard.module.css'

export function StudentDashboard() {
  const { user } = useAuth()
  const load = useCallback(() => fetchStudentDashboard(), [])
  const { status, data, error, retry } = useAsync(load, [])

  const courses = data?.current_courses ?? []
  const next = data?.next_lesson

  return (
    <div>
      <h1 className={styles.title}>
        Welcome back{user?.name ? `, ${user.name}` : ''}
      </h1>

      <DataState status={status} error={error} onRetry={retry}>
        <div className={styles.stats}>
          <StatCard label="Active courses" value={data?.active_courses ?? 0} icon={BookOpen} />
          <StatCard label="Completed" value={data?.completed_courses ?? 0} icon={GraduationCap} />
          <StatCard
            label="Attendance"
            value={data?.attendance_rate != null ? `${Math.round(data.attendance_rate)}%` : '—'}
            icon={CalendarCheck}
          />
          <StatCard
            label="Balance"
            value={data?.balance != null ? formatMoney(data.balance) : '—'}
            icon={Wallet}
          />
        </div>

        {next && (
          <Card className={styles.continueCard}>
            <div className={styles.continueBody}>
              <div>
                <p className={styles.continueEyebrow}>Continue learning</p>
                <p className={styles.continueTitle}>{next.title || next.lesson_title}</p>
                {next.course_name && (
                  <p className={styles.muted}>{next.course_name}</p>
                )}
              </div>
              <Link
                className={styles.continueLink}
                to={`/student/courses/${next.course_id}/lessons/${next.id ?? next.lesson_id}`}
              >
                Resume <ArrowRight className={styles.linkIcon} aria-hidden="true" />
              </Link>
            </div>
          </Card>
        )}

        <div className={styles.sectionHead}>
          <h2 className={styles.sectionTitle}>Your courses</h2>
          <Link className={styles.viewAll} to="/student/courses">
            View all
          </Link>
        </div>

        {courses.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="No active courses"
            description="Once you’re enrolled in a class, your courses appear here."
          />
        ) : (
          <ul className={styles.courseList}>
            {courses.map((c) => (
              <li key={c.id}>
                <Link className={styles.courseCard} to={`/student/courses/${c.id}`}>
                  <p className={styles.courseName}>{c.name || c.course_name}</p>
                  <ProgressBar value={c.progress_percent ?? 0} label="Progress" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </DataState>
    </div>
  )
}
