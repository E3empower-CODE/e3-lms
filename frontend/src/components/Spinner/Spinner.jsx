import styles from './Spinner.module.css'

/**
 * Accessible loading spinner. When `label` is non-empty it exposes an
 * accessible busy status; pass `label=""` for a purely decorative spinner
 * (e.g. inside a button that already announces `aria-busy`).
 */
export function Spinner({ size = 24, label = 'Loading…', inline = false }) {
  return (
    <span
      className={inline ? styles.inline : styles.block}
      role={label ? 'status' : undefined}
      aria-live={label ? 'polite' : undefined}
    >
      <span
        className={styles.spinner}
        style={{ width: size, height: size }}
        aria-hidden="true"
      />
      {label ? <span className={styles.srOnly}>{label}</span> : null}
    </span>
  )
}
