import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { Input } from '../../components/Input/Input'
import { Button } from '../../components/Button/Button'
import { Alert } from '../../components/Alert/Alert'
import { Card } from '../../components/Card/Card'
import { useAuth } from './AuthContext'
import { applyServerFieldErrors } from './formErrors'
import { homePathForRole } from '../../lib/roles'
import styles from './authForms.module.css'

// snake_case field names to match the API payload.
const schema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

export function LoginPage() {
  const { login, sessionExpired } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [formError, setFormError] = useState(null)

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema), defaultValues: { email: '', password: '' } })

  async function onSubmit(values) {
    setFormError(null)
    try {
      const user = await login(values)
      const dest = location.state?.from ?? homePathForRole(user.role)
      navigate(dest, { replace: true })
    } catch (err) {
      applyServerFieldErrors(err, setError, ['email', 'password'])
      setFormError(err.message)
    }
  }

  return (
    <div className={styles.wrap}>
      <Card title="Sign in" className={styles.card}>
        <p className={styles.subtitle}>Access your E3 Empower LMS account.</p>
        {sessionExpired && !formError && (
          <Alert variant="info" className={styles.alert}>
            Your session expired. Please sign in again.
          </Alert>
        )}
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
          <Input
            label="Password"
            type="password"
            autoComplete="current-password"
            error={errors.password?.message}
            {...register('password')}
          />
          <Button type="submit" loading={isSubmitting} className={styles.submit}>
            Sign in
          </Button>
        </form>
        <div className={styles.links}>
          <Link className={styles.link} to="/forgot-password">
            Forgot password?
          </Link>
        </div>
      </Card>
    </div>
  )
}
