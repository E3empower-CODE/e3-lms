import { forwardRef, useId } from 'react'
import styles from './Checkbox.module.css'

/** Labeled checkbox with accessible error wiring; forwards ref for RHF. */
export const Checkbox = forwardRef(function Checkbox(
  { label, error, id, className = '', ...rest },
  ref,
) {
  const autoId = useId()
  const inputId = id || autoId
  const errorId = `${inputId}-error`

  return (
    <div className={`${styles.field} ${className}`.trim()}>
      <div className={styles.row}>
        <input
          id={inputId}
          type="checkbox"
          ref={ref}
          className={styles.input}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          {...rest}
        />
        <label htmlFor={inputId} className={styles.label}>
          {label}
        </label>
      </div>
      {error && (
        <p id={errorId} className={styles.error}>
          {error}
        </p>
      )}
    </div>
  )
})
