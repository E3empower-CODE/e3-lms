import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from '../../../components/Input/Input'
import { emergencySchema } from '../schemas'
import { WizardFooter } from '../WizardFooter'
import styles from './steps.module.css'

export function EmergencyStep({ draft, onNext, onBack, canGoBack }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(emergencySchema),
    defaultValues: {
      emergency_name: draft.emergency_name ?? '',
      emergency_relationship: draft.emergency_relationship ?? '',
      emergency_phone: draft.emergency_phone ?? '',
      emergency_alt_phone: draft.emergency_alt_phone ?? '',
      emergency_email: draft.emergency_email ?? '',
    },
  })

  return (
    <form onSubmit={handleSubmit(onNext)} noValidate>
      <p className={styles.intro}>Who should we contact in an emergency?</p>
      <div className={styles.grid}>
        <Input
          label="Contact name"
          error={errors.emergency_name?.message}
          {...register('emergency_name')}
        />
        <Input
          label="Relationship"
          error={errors.emergency_relationship?.message}
          {...register('emergency_relationship')}
        />
        <Input
          label="Phone number"
          error={errors.emergency_phone?.message}
          {...register('emergency_phone')}
        />
        <Input
          label="Alternate phone (optional)"
          error={errors.emergency_alt_phone?.message}
          {...register('emergency_alt_phone')}
        />
        <Input
          label="Email (optional)"
          type="email"
          className={styles.full}
          error={errors.emergency_email?.message}
          {...register('emergency_email')}
        />
      </div>
      <WizardFooter onBack={onBack} canGoBack={canGoBack} />
    </form>
  )
}
