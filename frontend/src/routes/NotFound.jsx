import { Link } from 'react-router-dom'
import { Compass } from 'lucide-react'
import { EmptyState } from '../components/EmptyState/EmptyState'
import styles from './StatusPage.module.css'

/** 404 page for unknown routes. */
export function NotFound() {
  return (
    <div className={styles.page}>
      <EmptyState
        icon={Compass}
        title="Page not found"
        description="The page you’re looking for doesn’t exist or has moved."
        action={
          <Link className={styles.link} to="/">
            Back to safety
          </Link>
        }
      />
    </div>
  )
}
