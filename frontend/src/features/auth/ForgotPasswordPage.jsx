import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router-dom'
import { z } from 'zod'
import { Input } from '../../components/Input/Input'
import { Button } from '../../components/Button/Button'
import { Alert } from '../../components/Alert/Alert'
import { Card } from '../../components/Card/Card'
import { requestPasswordReset } from '../../lib/authApi'
import { applyServerFieldErrors } from './formErrors'
import styles from './authForms.module.css'

const schema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
})

export function ForgotPasswordPage() {
  const [status, setStatus] = useState('idle') // idle | done
  const [formError, setFormError] = useState(null)

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema), defaultValues: { email: '' } })

  async function onSubmit(values) {
    setFormError(null)
    try {
      await requestPasswordReset(values)
      setStatus('done')
    } catch (err) {
      applyServerFieldErrors(err, setError, ['email'])
      setFormError(err.message)
    }
  }

  return (
    <div className={styles.wrap}>
      <Card title="Reset your password" className={styles.card}>
        {status === 'done' ? (
          <>
            <Alert variant="success" title="Check your email">
              If an account exists for that address, we’ve sent a link to reset
              your password.
            </Alert>
            <div className={styles.links}>
              <Link className={styles.link} to="/login">
                Back to sign in
              </Link>
            </div>
          </>
        ) : (
          <>
            <p className={styles.subtitle}>
              Enter your email and we’ll send you a reset link.
            </p>
            {formError && (
              <Alert variant="error" className={styles.alert}>
                {formError}
              </Alert>
            )}
            <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
              <Input
                label="Email"
                type="email"
                autoComplete="email"
                error={errors.email?.message}
                {...register('email')}
              />
              <Button type="submit" loading={isSubmitting} className={styles.submit}>
                Send reset link
              </Button>
            </form>
            <div className={styles.links}>
              <Link className={styles.link} to="/login">
                Back to sign in
              </Link>
            </div>
          </>
        )}
      </Card>
    </div>
  )
}
