import styles from './EmptyState.module.css'

/** Purposeful empty state — one of the four required data-states. */
export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className={styles.empty}>
      {Icon && <Icon className={styles.icon} aria-hidden="true" />}
      <p className={styles.title}>{title}</p>
      {description && <p className={styles.description}>{description}</p>}
      {action && <div className={styles.action}>{action}</div>}
    </div>
  )
}
