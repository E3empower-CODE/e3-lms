import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router-dom'
import { z } from 'zod'
import { Input } from '../../components/Input/Input'
import { Button } from '../../components/Button/Button'
import { Alert } from '../../components/Alert/Alert'
import { Card } from '../../components/Card/Card'
import { changePassword } from '../../lib/authApi'
import { applyServerFieldErrors } from './formErrors'
import { newPasswordSchema } from './passwordSchema'
import styles from './authForms.module.css'

const schema = newPasswordSchema({
  current_password: z.string().min(1, 'Current password is required'),
})

export function ChangePasswordPage() {
  const [status, setStatus] = useState('idle') // idle | done
  const [formError, setFormError] = useState(null)

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { current_password: '', new_password: '', confirm_password: '' },
  })

  async function onSubmit(values) {
    setFormError(null)
    try {
      await changePassword({
        current_password: values.current_password,
        new_password: values.new_password,
      })
      setStatus('done')
      reset()
    } catch (err) {
      applyServerFieldErrors(err, setError, ['current_password', 'new_password'])
      setFormError(err.message)
    }
  }

  return (
    <div className={styles.wrap}>
      <Card title="Change password" className={styles.card}>
        {status === 'done' && (
          <Alert variant="success" className={styles.alert}>
            Your password has been changed.
          </Alert>
        )}
        {formError && (
          <Alert variant="error" className={styles.alert}>
            {formError}
          </Alert>
        )}
        <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
          <Input
            label="Current password"
            type="password"
            autoComplete="current-password"
            error={errors.current_password?.message}
            {...register('current_password')}
          />
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
        <div className={styles.links}>
          <Link className={styles.link} to="/">
            Back to dashboard
          </Link>
        </div>
      </Card>
    </div>
  )
}
