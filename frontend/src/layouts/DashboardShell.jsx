import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { Menu, X, LogOut, KeyRound } from 'lucide-react'
import { useAuth } from '../features/auth/AuthContext'
import { roleLabel } from '../lib/roles'
import styles from './DashboardShell.module.css'

/**
 * Authenticated app shell: persistent sidebar on desktop, focus-managed drawer
 * on mobile, and a header with the brand, a menu toggle, and the current user.
 *
 * @param {{label:string, to:string, icon:Function, end?:boolean}[]} navItems
 */
export function DashboardShell({ title, navItems }) {
  const { user, logout } = useAuth()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const location = useLocation()

  // Close the mobile drawer on navigation and on Escape.
  useEffect(() => {
    setDrawerOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!drawerOpen) return undefined
    function onKey(e) {
      if (e.key === 'Escape') setDrawerOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [drawerOpen])

  const nav = (
    <nav className={styles.nav} aria-label="Primary">
      {navItems.map(({ label, to, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`.trim()
          }
        >
          {Icon && <Icon className={styles.navIcon} aria-hidden="true" />}
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  )

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <button
          type="button"
          className={styles.menuButton}
          aria-label="Open navigation menu"
          aria-expanded={drawerOpen}
          aria-controls="mobile-drawer"
          onClick={() => setDrawerOpen(true)}
        >
          <Menu aria-hidden="true" />
        </button>
        <span className={styles.brand}>E3 Empower LMS</span>
        <span className={styles.spacer} />
        {user && (
          <span className={styles.user}>
            <span className={styles.userName}>{user.name || user.email}</span>
            <span className={styles.userRole}>{roleLabel(user.role)}</span>
          </span>
        )}
        <Link
          to="/account/password"
          className={styles.iconLink}
          aria-label="Change password"
          title="Change password"
        >
          <KeyRound className={styles.navIcon} aria-hidden="true" />
        </Link>
        <button type="button" className={styles.logout} onClick={logout}>
          <LogOut className={styles.navIcon} aria-hidden="true" />
          <span className={styles.logoutLabel}>Sign out</span>
        </button>
      </header>

      <div className={styles.body}>
        <aside className={styles.sidebar} aria-label="Sidebar">
          {nav}
        </aside>

        {drawerOpen && (
          <div className={styles.overlay} onClick={() => setDrawerOpen(false)}>
            <div
              id="mobile-drawer"
              className={styles.drawer}
              role="dialog"
              aria-modal="true"
              aria-label="Navigation"
              onClick={(e) => e.stopPropagation()}
            >
              <div className={styles.drawerHead}>
                <span className={styles.brand}>Menu</span>
                <button
                  type="button"
                  className={styles.menuButton}
                  aria-label="Close navigation menu"
                  onClick={() => setDrawerOpen(false)}
                >
                  <X aria-hidden="true" />
                </button>
              </div>
              {nav}
            </div>
          </div>
        )}

        <main className={styles.main}>
          {title && <h1 className={styles.pageTitle}>{title}</h1>}
          <Outlet />
        </main>
      </div>
    </div>
  )
}
