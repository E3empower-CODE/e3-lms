import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from '../../../components/Input/Input'
import { Select } from '../../../components/Select/Select'
import { Checkbox } from '../../../components/Checkbox/Checkbox'
import { Textarea } from '../../../components/Textarea/Textarea'
import { educationSchema, EDUCATION_LEVELS } from '../schemas'
import { WizardFooter } from '../WizardFooter'
import styles from './steps.module.css'

export function EducationStep({ draft, onNext, onBack, canGoBack }) {
  const {
    register,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(educationSchema),
    defaultValues: {
      education_level: draft.education_level ?? '',
      institution: draft.institution ?? '',
      current_level: draft.current_level ?? '',
      previous_computer_training: draft.previous_computer_training ?? false,
      training_description: draft.training_description ?? '',
    },
  })

  const hadTraining = watch('previous_computer_training')

  return (
    <form onSubmit={handleSubmit(onNext)} noValidate>
      <p className={styles.intro}>Your educational background.</p>
      <div className={styles.grid}>
        <Select
          label="Highest education level"
          placeholder="Select…"
          options={EDUCATION_LEVELS}
          error={errors.education_level?.message}
          {...register('education_level')}
        />
        <Input label="Institution" error={errors.institution?.message} {...register('institution')} />
        <Input
          label="Current level (optional)"
          hint="e.g. Year 2, SS3"
          error={errors.current_level?.message}
          {...register('current_level')}
        />
        <Checkbox
          label="I have previous computer training"
          className={styles.full}
          {...register('previous_computer_training')}
        />
        {hadTraining && (
          <Textarea
            label="Describe your previous computer training"
            className={styles.full}
            error={errors.training_description?.message}
            {...register('training_description')}
          />
        )}
      </div>
      <WizardFooter onBack={onBack} canGoBack={canGoBack} />
    </form>
  )
}
