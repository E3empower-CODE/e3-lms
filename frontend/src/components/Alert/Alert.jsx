import styles from './Alert.module.css'

/**
 * Status/alert banner. Errors use role="alert" (assertive); other variants use
 * role="status" (polite). Color is paired with a text label — never color alone.
 * @param {'success'|'warning'|'error'|'info'} [variant]
 */
export function Alert({ variant = 'info', title, children, className = '' }) {
  const isError = variant === 'error'
  return (
    <div
      className={`${styles.alert} ${styles[variant]} ${className}`.trim()}
      role={isError ? 'alert' : 'status'}
    >
      {title && <p className={styles.title}>{title}</p>}
      {children && <div className={styles.body}>{children}</div>}
    </div>
  )
}
