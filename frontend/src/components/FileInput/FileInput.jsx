import { useId, useRef } from 'react'
import { UploadCloud } from 'lucide-react'
import styles from './FileInput.module.css'

/**
 * Controlled file picker (single file). Client-side type/size checks are a
 * courtesy — the server remains authoritative on upload validation.
 *
 * @param {File|null} value
 * @param {(file: File|null) => void} onChange
 */
export function FileInput({
  label,
  value,
  onChange,
  error,
  hint,
  accept = 'image/jpeg,image/png',
  id,
  className = '',
}) {
  const autoId = useId()
  const inputId = id || autoId
  const errorId = `${inputId}-error`
  const hintId = `${inputId}-hint`
  const inputRef = useRef(null)
  const describedBy =
    [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(' ') ||
    undefined

  return (
    <div className={`${styles.field} ${className}`.trim()}>
      {label && (
        <label htmlFor={inputId} className={styles.label}>
          {label}
        </label>
      )}
      <div className={styles.control}>
        <button
          type="button"
          className={styles.button}
          onClick={() => inputRef.current?.click()}
        >
          <UploadCloud className={styles.icon} aria-hidden="true" />
          Choose file
        </button>
        <span className={styles.filename}>
          {value ? value.name : 'No file selected'}
        </span>
      </div>
      <input
        id={inputId}
        ref={inputRef}
        type="file"
        accept={accept}
        className={styles.hiddenInput}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        onChange={(e) => onChange(e.target.files?.[0] ?? null)}
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
}
