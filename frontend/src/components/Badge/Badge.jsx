import styles from './Badge.module.css'

/**
 * Small status pill. Color is paired with its text label, never used alone.
 * @param {'neutral'|'success'|'warning'|'error'|'info'} [variant]
 */
export function Badge({ variant = 'neutral', children }) {
  return <span className={`${styles.badge} ${styles[variant]}`}>{children}</span>
}
