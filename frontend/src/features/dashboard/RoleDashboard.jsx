import { useAuth } from '../auth/AuthContext'
import { roleLabel } from '../../lib/roles'
import { Card } from '../../components/Card/Card'
import styles from './RoleDashboard.module.css'

/**
 * P0 dashboard landing for each shell. Real metrics/charts arrive with the
 * per-role phases (admissions P3, student P5, instructor P6, reporting P10).
 */
export function RoleDashboard({ scope }) {
  const { user } = useAuth()
  return (
    <div className={styles.wrap}>
      <Card>
        <p className={styles.eyebrow}>{roleLabel(user?.role)} workspace</p>
        <h2 className={styles.heading}>
          Welcome back{user?.name ? `, ${user.name}` : ''}.
        </h2>
        <p className={styles.body}>
          This is the {scope} dashboard shell. Metrics, lists, and charts are
          added in later roadmap phases; navigation and access control are live.
        </p>
      </Card>
    </div>
  )
}
