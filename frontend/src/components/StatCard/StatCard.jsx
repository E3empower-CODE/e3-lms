import styles from './StatCard.module.css'

/** Compact metric tile for dashboards. */
export function StatCard({ label, value, icon: Icon, tone = 'default' }) {
  return (
    <div className={`${styles.card} ${styles[tone]}`}>
      {Icon && (
        <span className={styles.iconWrap} aria-hidden="true">
          <Icon className={styles.icon} />
        </span>
      )}
      <div>
        <p className={styles.value}>{value}</p>
        <p className={styles.label}>{label}</p>
      </div>
    </div>
  )
}
