import { useCallback } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, Circle, PlayCircle } from 'lucide-react'
import { ProgressBar } from '../../components/ProgressBar/ProgressBar'
import { DataState } from '../../components/DataState/DataState'
import { EmptyState } from '../../components/EmptyState/EmptyState'
import { useAsync } from '../../hooks/useAsync'
import { fetchMyCourse } from './meApi'
import styles from './CourseDetail.module.css'

export function CourseDetail() {
  const { id } = useParams()
  const load = useCallback(() => fetchMyCourse(id), [id])
  const { status, data: course, error, retry } = useAsync(load, [id])

  const modules = course?.modules ?? []

  return (
    <div>
      <Link className={styles.back} to="/student/courses">
        <ArrowLeft className={styles.backIcon} aria-hidden="true" />
        My courses
      </Link>

      <DataState status={status} error={error} onRetry={retry}>
        {course && (
          <>
            <h1 className={styles.title}>{course.name || course.course_name}</h1>
            {course.description && <p className={styles.desc}>{course.description}</p>}
            <div className={styles.progress}>
              <ProgressBar value={course.progress_percent ?? 0} label="Course progress" />
            </div>

            {modules.length === 0 ? (
              <EmptyState
                title="No lessons yet"
                description="Your instructor hasn’t published lessons for this course yet."
              />
            ) : (
              <div className={styles.modules}>
                {modules.map((mod) => (
                  <section key={mod.id} className={styles.module}>
                    <h2 className={styles.moduleTitle}>{mod.title || mod.name}</h2>
                    <ul className={styles.lessons}>
                      {(mod.lessons ?? []).map((lesson) => {
                        const done = lesson.is_completed
                        return (
                          <li key={lesson.id}>
                            <Link
                              className={styles.lesson}
                              to={`/student/courses/${id}/lessons/${lesson.id}`}
                            >
                              <span className={styles.lessonIcon} aria-hidden="true">
                                {done ? (
                                  <CheckCircle2 className={styles.doneIcon} />
                                ) : (
                                  <Circle className={styles.todoIcon} />
                                )}
                              </span>
                              <span className={styles.lessonTitle}>
                                {lesson.title || lesson.name}
                              </span>
                              <PlayCircle className={styles.playIcon} aria-hidden="true" />
                              <span className={styles.srOnly}>
                                {done ? 'Completed' : 'Not completed'}
                              </span>
                            </Link>
                          </li>
                        )
                      })}
                    </ul>
                  </section>
                ))}
              </div>
            )}
          </>
        )}
      </DataState>
    </div>
  )
}
