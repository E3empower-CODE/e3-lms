import { forwardRef, useId } from 'react'
import styles from './Textarea.module.css'

/** Labeled textarea with accessible error/hint wiring; forwards ref for RHF. */
export const Textarea = forwardRef(function Textarea(
  { label, error, hint, id, rows = 4, className = '', ...rest },
  ref,
) {
  const autoId = useId()
  const areaId = id || autoId
  const errorId = `${areaId}-error`
  const hintId = `${areaId}-hint`
  const describedBy =
    [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(' ') ||
    undefined

  return (
    <div className={`${styles.field} ${className}`.trim()}>
      {label && (
        <label htmlFor={areaId} className={styles.label}>
          {label}
        </label>
      )}
      <textarea
        id={areaId}
        ref={ref}
        rows={rows}
        className={styles.textarea}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        {...rest}
      />
      {hint && !error && (
        <p id={hintId} className={styles.hint}>
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className={styles.error}>
          {error}
        </p>
      )}
    </div>
  )
})
