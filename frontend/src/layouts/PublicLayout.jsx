import { Link, Outlet } from 'react-router-dom'
import styles from './PublicLayout.module.css'

/** Unauthenticated shell for login and public registration. */
export function PublicLayout() {
  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <Link to="/" className={styles.brand}>
          E3 Empower LMS
        </Link>
      </header>
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  )
}
