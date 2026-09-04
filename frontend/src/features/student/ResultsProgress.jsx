import { useCallback } from 'react'
import { Card } from '../../components/Card/Card'
import { Badge } from '../../components/Badge/Badge'
import { ProgressBar } from '../../components/ProgressBar/ProgressBar'
import { DataState } from '../../components/DataState/DataState'
import { useAsync } from '../../hooks/useAsync'
import { fetchMyProgress, fetchMyAttendance } from './meApi'
import {
  ATTENDANCE_STATUS_LABELS,
  ATTENDANCE_STATUS_VARIANTS,
} from '../attendance/status'
import { formatDate } from '../../lib/format'
import styles from './ResultsProgress.module.css'

const COMPONENT_LABELS = {
  lessons: 'Lessons',
  assignments: 'Assignments',
  assessments: 'Assessments',
  attendance: 'Attendance',
}

/** Read a component percent from either a nested `components` map or flat keys. */
function componentPercent(progress, key) {
  const c = progress?.components?.[key]
  if (c != null) return typeof c === 'object' ? (c.percent ?? 0) : c
  return progress?.[`${key}_percent`] ?? null
}

export function ResultsProgress() {
  const loadProgress = useCallback(() => fetchMyProgress(), [])
  const loadAttendance = useCallback(() => fetchMyAttendance(), [])
  const progress = useAsync(loadProgress, [])
  const attendance = useAsync(loadAttendance, [])

  const p = progress.data
  const history = attendance.data ?? []

  return (
    <div>
      <h1 className={styles.title}>Results &amp; progress</h1>

      <Card className={styles.section} title="Overall progress">
        <DataState status={progress.status} error={progress.error} onRetry={progress.retry}>
          <div className={styles.overall}>
            <ProgressBar value={p?.overall_percent ?? 0} label="Overall" />
          </div>
          <ul className={styles.components}>
            {Object.entries(COMPONENT_LABELS).map(([key, label]) => {
              const value = componentPercent(p, key)
              if (value == null) return null
              return (
                <li key={key} className={styles.component}>
                  <ProgressBar value={value} label={label} />
                </li>
              )
            })}
          </ul>
          <p className={styles.note}>
            Progress is calculated by the school from your verified learning
            activity.
          </p>
        </DataState>
      </Card>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Attendance history</h2>
        <DataState
          status={attendance.status}
          error={attendance.error}
          onRetry={attendance.retry}
          isEmpty={attendance.status === 'success' && history.length === 0}
          empty={{
            title: 'No attendance records',
            description: 'Your class attendance will appear here.',
          }}
        >
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th scope="col">Date</th>
                  <th scope="col">Class</th>
                  <th scope="col">Status</th>
                </tr>
              </thead>
              <tbody>
                {history.map((r, i) => (
                  <tr key={r.id ?? i}>
                    <td>{formatDate(r.date)}</td>
                    <td className={styles.muted}>{r.class_name || r.course_name || '—'}</td>
                    <td>
                      <Badge variant={ATTENDANCE_STATUS_VARIANTS[r.status] || 'neutral'}>
                        {ATTENDANCE_STATUS_LABELS[r.status] || r.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <ul className={styles.cards}>
            {history.map((r, i) => (
              <li key={r.id ?? i} className={styles.card}>
                <div className={styles.cardTop}>
                  <span>{formatDate(r.date)}</span>
                  <Badge variant={ATTENDANCE_STATUS_VARIANTS[r.status] || 'neutral'}>
                    {ATTENDANCE_STATUS_LABELS[r.status] || r.status}
                  </Badge>
                </div>
                <p className={styles.muted}>{r.class_name || r.course_name || '—'}</p>
              </li>
            ))}
          </ul>
        </DataState>
      </section>
    </div>
  )
}
