import { Link } from 'react-router-dom'
import { ShieldAlert } from 'lucide-react'
import { EmptyState } from '../components/EmptyState/EmptyState'
import styles from './StatusPage.module.css'

/** 403 page shown when an authenticated user lacks access. */
export function Forbidden() {
  return (
    <div className={styles.page}>
      <EmptyState
        icon={ShieldAlert}
        title="Access denied"
        description="You don’t have permission to view this page. If you think this is a mistake, contact an administrator."
        action={
          <Link className={styles.link} to="/">
            Go to your dashboard
          </Link>
        }
      />
    </div>
  )
}
