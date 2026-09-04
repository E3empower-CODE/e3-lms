import { forwardRef, useId } from 'react'
import styles from './Select.module.css'

/**
 * Labeled native select with accessible error/hint wiring. Forwards its ref so
 * it composes with react-hook-form `register`.
 * @param {{value:string,label:string}[]} options
 */
export const Select = forwardRef(function Select(
  { label, error, hint, id, options, placeholder, className = '', ...rest },
  ref,
) {
  const autoId = useId()
  const selectId = id || autoId
  const errorId = `${selectId}-error`
  const hintId = `${selectId}-hint`
  const describedBy =
    [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(' ') ||
    undefined

  return (
    <div className={`${styles.field} ${className}`.trim()}>
      {label && (
        <label htmlFor={selectId} className={styles.label}>
          {label}
        </label>
      )}
      <select
        id={selectId}
        ref={ref}
        className={styles.select}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        {...rest}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
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
