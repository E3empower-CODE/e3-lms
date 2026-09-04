import { useCallback } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen } from 'lucide-react'
import { ProgressBar } from '../../components/ProgressBar/ProgressBar'
import { Badge } from '../../components/Badge/Badge'
import { DataState } from '../../components/DataState/DataState'
import { useAsync } from '../../hooks/useAsync'
import { fetchMyCourses } from './meApi'
import styles from './MyCourses.module.css'

export function MyCourses() {
  const load = useCallback(() => fetchMyCourses(), [])
  const { status, data, error, retry } = useAsync(load, [])
  const courses = data ?? []

  return (
    <div>
      <h1 className={styles.title}>My courses</h1>

      <DataState
        status={status}
        error={error}
        onRetry={retry}
        isEmpty={status === 'success' && courses.length === 0}
        empty={{
          icon: BookOpen,
          title: 'No courses yet',
          description: 'When you’re enrolled in a class, it appears here.',
        }}
      >
        <ul className={styles.grid}>
          {courses.map((c) => {
            const done = (c.progress_percent ?? 0) >= 100
            return (
              <li key={c.id}>
                <Link className={styles.card} to={`/student/courses/${c.id}`}>
                  <div className={styles.cardHead}>
                    <p className={styles.name}>{c.name || c.course_name}</p>
                    {done && <Badge variant="success">Completed</Badge>}
                  </div>
                  {c.category_name && <p className={styles.muted}>{c.category_name}</p>}
                  <ProgressBar value={c.progress_percent ?? 0} label="Progress" />
                  {c.lessons_total != null && (
                    <p className={styles.meta}>
                      {c.lessons_completed ?? 0} of {c.lessons_total} lessons complete
                    </p>
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      </DataState>
    </div>
  )
}
