import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useSearchParams } from 'react-router-dom'
import { Input } from '../../components/Input/Input'
import { Button } from '../../components/Button/Button'
import { Alert } from '../../components/Alert/Alert'
import { Card } from '../../components/Card/Card'
import { confirmPasswordReset } from '../../lib/authApi'
import { applyServerFieldErrors } from './formErrors'
import { newPasswordSchema } from './passwordSchema'
import styles from './authForms.module.css'

const schema = newPasswordSchema()

export function ResetPasswordPage() {
  const [params] = useSearchParams()
  const uid = params.get('uid') || ''
  const token = params.get('token') || ''
  const hasLink = Boolean(uid && token)

  const [status, setStatus] = useState('idle') // idle | done
  const [formError, setFormError] = useState(null)

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { new_password: '', confirm_password: '' },
  })

  async function onSubmit(values) {
    setFormError(null)
    try {
      await confirmPasswordReset({
        uid,
        token,
        new_password: values.new_password,
      })
      setStatus('done')
    } catch (err) {
      applyServerFieldErrors(err, setError, ['new_password'])
      setFormError(err.message)
    }
  }

  return (
    <div className={styles.wrap}>
      <Card title="Choose a new password" className={styles.card}>
        {!hasLink && (
          <Alert variant="error" title="Invalid or missing reset link">
            Request a new link from the{' '}
            <Link className={styles.link} to="/forgot-password">
              forgot-password
            </Link>{' '}
            page.
          </Alert>
        )}

        {hasLink && status === 'done' && (
          <>
            <Alert variant="success" title="Password updated">
              You can now sign in with your new password.
            </Alert>
            <div className={styles.links}>
              <Link className={styles.link} to="/login">
                Go to sign in
              </Link>
            </div>
          </>
        )}

        {hasLink && status !== 'done' && (
          <>
            {formError && (
              <Alert variant="error" className={styles.alert}>
                {formError}
              </Alert>
            )}
            <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
              <Input
                label="New password"
                type="password"
                autoComplete="new-password"
                hint="At least 8 characters."
                error={errors.new_password?.message}
                {...register('new_password')}
              />
              <Input
                label="Confirm new password"
                type="password"
                autoComplete="new-password"
                error={errors.confirm_password?.message}
                {...register('confirm_password')}
              />
              <Button type="submit" loading={isSubmitting} className={styles.submit}>
                Update password
              </Button>
            </form>
          </>
        )}
      </Card>
    </div>
  )
}
