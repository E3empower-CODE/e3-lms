import { useId, useState } from 'react'
import styles from './Tabs.module.css'

/**
 * Minimal accessible tabs (ARIA tablist). Uncontrolled; renders the active
 * panel's content.
 * @param {{key:string,label:string,content:React.ReactNode}[]} tabs
 */
export function Tabs({ tabs }) {
  const [active, setActive] = useState(tabs[0]?.key)
  const baseId = useId()

  return (
    <div>
      <div className={styles.tablist} role="tablist" aria-label="Sections">
        {tabs.map((tab) => {
          const selected = tab.key === active
          return (
            <button
              key={tab.key}
              type="button"
              role="tab"
              id={`${baseId}-${tab.key}-tab`}
              aria-selected={selected}
              aria-controls={`${baseId}-${tab.key}-panel`}
              tabIndex={selected ? 0 : -1}
              className={`${styles.tab} ${selected ? styles.active : ''}`.trim()}
              onClick={() => setActive(tab.key)}
            >
              {tab.label}
            </button>
          )
        })}
      </div>
      {tabs.map((tab) => (
        <div
          key={tab.key}
          role="tabpanel"
          id={`${baseId}-${tab.key}-panel`}
          aria-labelledby={`${baseId}-${tab.key}-tab`}
          hidden={tab.key !== active}
          className={styles.panel}
        >
          {tab.key === active && tab.content}
        </div>
      ))}
    </div>
  )
}
