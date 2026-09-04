import { useCallback, useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from '../../../components/Input/Input'
import { Select } from '../../../components/Select/Select'
import { Alert } from '../../../components/Alert/Alert'
import { DataState } from '../../../components/DataState/DataState'
import { fetchCourses } from '../registrationApi'
import { coursesSchema, SESSION_OPTIONS } from '../schemas'
import { formatMoney } from '../../../lib/format'
import { WizardFooter } from '../WizardFooter'
import stepStyles from './steps.module.css'
import styles from './CoursesStep.module.css'

function useCourses() {
  const [state, setState] = useState({ status: 'loading', error: null, courses: [] })

  const load = useCallback(async () => {
    setState({ status: 'loading', error: null, courses: [] })
    try {
      const courses = await fetchCourses()
      setState({ status: 'success', error: null, courses })
    } catch (error) {
      setState({ status: 'error', error, courses: [] })
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return { ...state, retry: load }
}

export function CoursesStep({ draft, onNext, onBack, canGoBack }) {
  const { status, error, courses, retry } = useCourses()

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(coursesSchema),
    defaultValues: {
      course_ids: draft.course_ids ?? [],
      preferred_start_date: draft.preferred_start_date ?? '',
      preferred_session: draft.preferred_session ?? '',
    },
  })

  const selectedIds = watch('course_ids')
  const selectedCourses = courses.filter((c) => selectedIds.includes(c.id))
  const subtotal = selectedCourses.reduce(
    (sum, c) => sum + Number(c.fee ?? 0),
    0,
  )

  // Carry display-only course summaries (name/fee) for the review step. Keys
  // prefixed with "_" are not sent to the server (it recomputes fees).
  const submit = (values) =>
    onNext({
      ...values,
      _selected_courses: selectedCourses.map((c) => ({
        id: c.id,
        name: c.name,
        fee: c.fee,
      })),
    })

  return (
    <form onSubmit={handleSubmit(submit)} noValidate>
      <p className={stepStyles.intro}>
        Choose your courses and preferred schedule. Fees shown are the school’s
        current snapshot; the final total is confirmed by the school on review.
      </p>

      <DataState
        status={status}
        error={error}
        onRetry={retry}
        isEmpty={status === 'success' && courses.length === 0}
        empty={{
          title: 'No courses available',
          description: 'There are no open courses to register for right now.',
        }}
      >
        <Controller
          name="course_ids"
          control={control}
          render={({ field }) => (
            <fieldset className={styles.fieldset}>
              <legend className={styles.legend}>Available courses</legend>
              <ul className={styles.list}>
                {courses.map((course) => {
                  const checked = field.value.includes(course.id)
                  return (
                    <li key={course.id} className={styles.item}>
                      <label className={styles.option}>
                        <input
                          type="checkbox"
                          className={styles.checkbox}
                          checked={checked}
                          onChange={(e) => {
                            field.onChange(
                              e.target.checked
                                ? [...field.value, course.id]
                                : field.value.filter((id) => id !== course.id),
                            )
                          }}
                        />
                        <span className={styles.courseName}>
                          {course.name}
                          {course.category_name && (
                            <span className={styles.category}> · {course.category_name}</span>
                          )}
                        </span>
                      </label>
                      <span className={styles.fee}>{formatMoney(course.fee)}</span>
                    </li>
                  )
                })}
              </ul>
              {errors.course_ids && (
                <p className={styles.error}>{errors.course_ids.message}</p>
              )}
            </fieldset>
          )}
        />

        {selectedIds.length > 0 && (
          <p className={styles.subtotal}>
            Estimated subtotal: <strong>{formatMoney(subtotal)}</strong>
            <span className={styles.note}> (confirmed by the school)</span>
          </p>
        )}

        <div className={stepStyles.grid}>
          <Input
            label="Preferred start date"
            type="date"
            error={errors.preferred_start_date?.message}
            {...register('preferred_start_date')}
          />
          <Select
            label="Preferred session"
            placeholder="Select…"
            options={SESSION_OPTIONS}
            error={errors.preferred_session?.message}
            {...register('preferred_session')}
          />
        </div>
      </DataState>

      {status !== 'success' && (
        <Alert variant="info" className={styles.blocked}>
          Course selection needs the catalog to load before you can continue.
        </Alert>
      )}

      <WizardFooter onBack={onBack} canGoBack={canGoBack} />
    </form>
  )
}
