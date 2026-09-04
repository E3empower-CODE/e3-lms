import { Link } from 'react-router-dom'
import { CheckCircle2 } from 'lucide-react'
import { Card } from '../../components/Card/Card'
import styles from './RegistrationSuccess.module.css'

/** Confirmation shown after a successful submission. */
export function RegistrationSuccess({ result }) {
  const number = result?.application_number || result?.number

  return (
    <div className={styles.wrap}>
      <Card className={styles.card}>
        <CheckCircle2 className={styles.icon} aria-hidden="true" />
        <h1 className={styles.title}>Application submitted</h1>
        <p className={styles.body}>
          Thank you for registering with E3 Empower. Your application has been
          received and is now pending review.
        </p>
        {number && (
          <p className={styles.number}>
            Your application number is <strong>{number}</strong>. Keep it for
            your records.
          </p>
        )}
        <Link className={styles.link} to="/login">
          Go to sign in
        </Link>
      </Card>
    </div>
  )
}
