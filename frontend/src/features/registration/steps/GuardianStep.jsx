import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from '../../../components/Input/Input'
import { Alert } from '../../../components/Alert/Alert'
import { guardianSchema } from '../schemas'
import { WizardFooter } from '../WizardFooter'
import styles from './steps.module.css'

export function GuardianStep({ draft, onNext, onBack, canGoBack }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(guardianSchema),
    defaultValues: {
      guardian_full_name: draft.guardian_full_name ?? '',
      guardian_relationship: draft.guardian_relationship ?? '',
      guardian_phone: draft.guardian_phone ?? '',
      guardian_email: draft.guardian_email ?? '',
    },
  })

  return (
    <form onSubmit={handleSubmit(onNext)} noValidate>
      <Alert variant="info" className={styles.intro}>
        The applicant is under 18, so a parent or guardian’s details are required.
      </Alert>
      <div className={styles.grid}>
        <Input
          label="Guardian full name"
          error={errors.guardian_full_name?.message}
          {...register('guardian_full_name')}
        />
        <Input
          label="Relationship to applicant"
          error={errors.guardian_relationship?.message}
          {...register('guardian_relationship')}
        />
        <Input
          label="Guardian phone"
          error={errors.guardian_phone?.message}
          {...register('guardian_phone')}
        />
        <Input
          label="Guardian email (optional)"
          type="email"
          error={errors.guardian_email?.message}
          {...register('guardian_email')}
        />
      </div>
      <WizardFooter onBack={onBack} canGoBack={canGoBack} />
    </form>
  )
}
