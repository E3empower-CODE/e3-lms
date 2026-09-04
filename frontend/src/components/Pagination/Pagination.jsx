import { ChevronLeft, ChevronRight } from 'lucide-react'
import styles from './Pagination.module.css'

/**
 * Simple prev/next pager driven by server pagination metadata.
 * @param {number} page
 * @param {number} totalPages
 * @param {(page: number) => void} onChange
 */
export function Pagination({ page, totalPages, onChange }) {
  if (!totalPages || totalPages <= 1) return null
  return (
    <nav className={styles.wrap} aria-label="Pagination">
      <button
        type="button"
        className={styles.button}
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
      >
        <ChevronLeft className={styles.icon} aria-hidden="true" />
        Previous
      </button>
      <span className={styles.status} aria-live="polite">
        Page {page} of {totalPages}
      </span>
      <button
        type="button"
        className={styles.button}
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
      >
        Next
        <ChevronRight className={styles.icon} aria-hidden="true" />
      </button>
    </nav>
  )
}
