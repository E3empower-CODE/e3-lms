import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Select } from '../../../components/Select/Select'
import { Checkbox } from '../../../components/Checkbox/Checkbox'
import { Textarea } from '../../../components/Textarea/Textarea'
import { additionalSchema, REFERRAL_SOURCES } from '../schemas'
import { WizardFooter } from '../WizardFooter'
import styles from './steps.module.css'

export function AdditionalStep({ draft, onNext, onBack, canGoBack }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(additionalSchema),
    defaultValues: {
      has_computer_access: draft.has_computer_access ?? false,
      reason_for_joining: draft.reason_for_joining ?? '',
      referral_source: draft.referral_source ?? '',
    },
  })

  return (
    <form onSubmit={handleSubmit(onNext)} noValidate>
      <p className={styles.intro}>A few more details.</p>
      <div className={styles.grid}>
        <Checkbox
          label="I have access to a computer or laptop"
          className={styles.full}
          {...register('has_computer_access')}
        />
        <Textarea
          label="Why do you want to join?"
          className={styles.full}
          error={errors.reason_for_joining?.message}
          {...register('reason_for_joining')}
        />
        <Select
          label="How did you hear about us?"
          placeholder="Select…"
          options={REFERRAL_SOURCES}
          className={styles.full}
          error={errors.referral_source?.message}
          {...register('referral_source')}
        />
      </div>
      <WizardFooter onBack={onBack} canGoBack={canGoBack} />
    </form>
  )
}
