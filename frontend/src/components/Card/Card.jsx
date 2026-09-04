import styles from './Card.module.css'

/** Surface container for grouped content. */
export function Card({ as: Tag = 'section', title, children, className = '' }) {
  return (
    <Tag className={`${styles.card} ${className}`.trim()}>
      {title && <h2 className={styles.title}>{title}</h2>}
      {children}
    </Tag>
  )
}
