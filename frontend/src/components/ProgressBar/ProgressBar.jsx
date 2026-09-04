import styles from './ProgressBar.module.css'

/**
 * Accessible progress bar. `value` is a server-provided percentage (0–100);
 * progress is never computed on the client.
 */
export function ProgressBar({ value = 0, label, showValue = true }) {
  const pct = Math.max(0, Math.min(100, Math.round(value)))
  return (
    <div className={styles.wrap}>
      {(label || showValue) && (
        <div className={styles.head}>
          {label && <span className={styles.label}>{label}</span>}
          {showValue && <span className={styles.value}>{pct}%</span>}
        </div>
      )}
      <div
        className={styles.track}
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label || 'Progress'}
      >
        <div className={styles.fill} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
