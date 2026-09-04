import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from '../../../components/Input/Input'
import { Select } from '../../../components/Select/Select'
import { FileInput } from '../../../components/FileInput/FileInput'
import { applicantSchema, GENDER_OPTIONS } from '../schemas'
import { WizardFooter } from '../WizardFooter'
import styles from './steps.module.css'

const MAX_PHOTO_MB = 5

export function ApplicantStep({ draft, onNext, onBack, canGoBack }) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(applicantSchema),
    defaultValues: {
      first_name: draft.first_name ?? '',
      last_name: draft.last_name ?? '',
      birth_date: draft.birth_date ?? '',
      gender: draft.gender ?? '',
      nationality: draft.nationality ?? '',
      email: draft.email ?? '',
      phone: draft.phone ?? '',
      address_line: draft.address_line ?? '',
      city: draft.city ?? '',
      state_region: draft.state_region ?? '',
      country: draft.country ?? '',
    },
  })

  return (
    <form onSubmit={handleSubmit(onNext)} noValidate>
      <p className={styles.intro}>Tell us about the applicant.</p>
      <div className={styles.grid}>
        <Input label="First name" error={errors.first_name?.message} {...register('first_name')} />
        <Input label="Last name" error={errors.last_name?.message} {...register('last_name')} />
        <Input
          label="Birth date"
          type="date"
          error={errors.birth_date?.message}
          {...register('birth_date')}
        />
        <Select
          label="Gender"
          placeholder="Select…"
          options={GENDER_OPTIONS}
          error={errors.gender?.message}
          {...register('gender')}
        />
        <Input label="Nationality" error={errors.nationality?.message} {...register('nationality')} />
        <Input label="Email" type="email" error={errors.email?.message} {...register('email')} />
        <Input label="Phone number" error={errors.phone?.message} {...register('phone')} />
        <Input
          label="Address"
          className={styles.full}
          error={errors.address_line?.message}
          {...register('address_line')}
        />
        <Input label="City" error={errors.city?.message} {...register('city')} />
        <Input label="State/Region" error={errors.state_region?.message} {...register('state_region')} />
        <Input label="Country" error={errors.country?.message} {...register('country')} />
        <Controller
          name="passport_photo"
          control={control}
          defaultValue={draft.passport_photo ?? null}
          rules={{
            validate: (file) => {
              if (!file) return true
              if (file.size > MAX_PHOTO_MB * 1024 * 1024)
                return `File must be ${MAX_PHOTO_MB}MB or smaller`
              return true
            },
          }}
          render={({ field, fieldState }) => (
            <FileInput
              label="Passport photo (optional)"
              hint="JPG or PNG, up to 5MB."
              value={field.value}
              onChange={field.onChange}
              error={fieldState.error?.message}
              className={styles.full}
            />
          )}
        />
      </div>
      <WizardFooter onBack={onBack} canGoBack={canGoBack} />
    </form>
  )
}
