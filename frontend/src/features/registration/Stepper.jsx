import { Check } from 'lucide-react'
import styles from './Stepper.module.css'

/**
 * Progress indicator for the wizard. Compact "Step X of N" on mobile; a full
 * labeled list on wider screens.
 * @param {{key:string,label:string}[]} steps
 * @param {number} current  zero-based index
 */
export function Stepper({ steps, current }) {
  return (
    <div className={styles.wrap}>
      <p className={styles.compact}>
        Step {current + 1} of {steps.length}:{' '}
        <span className={styles.compactLabel}>{steps[current]?.label}</span>
      </p>
      <ol className={styles.list} aria-label="Registration progress">
        {steps.map((step, index) => {
          const state =
            index < current ? 'done' : index === current ? 'current' : 'upcoming'
          return (
            <li
              key={step.key}
              className={`${styles.item} ${styles[state]}`}
              aria-current={state === 'current' ? 'step' : undefined}
            >
              <span className={styles.marker} aria-hidden="true">
                {state === 'done' ? <Check className={styles.check} /> : index + 1}
              </span>
              <span className={styles.itemLabel}>{step.label}</span>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
