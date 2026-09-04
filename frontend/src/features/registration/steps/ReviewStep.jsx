import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Checkbox } from '../../../components/Checkbox/Checkbox'
import { Alert } from '../../../components/Alert/Alert'
import { Button } from '../../../components/Button/Button'
import { declarationSchema } from '../schemas'
import { formatMoney, formatDate } from '../../../lib/format'
import styles from './ReviewStep.module.css'

function Row({ label, value }) {
  if (value == null || value === '') return null
  return (
    <div className={styles.row}>
      <dt className={styles.term}>{label}</dt>
      <dd className={styles.desc}>{value}</dd>
    </div>
  )
}

function Section({ title, onEdit, children }) {
  return (
    <section className={styles.section}>
      <div className={styles.sectionHead}>
        <h3 className={styles.sectionTitle}>{title}</h3>
        {onEdit && (
          <button type="button" className={styles.edit} onClick={onEdit}>
            Edit
          </button>
        )}
      </div>
      <dl className={styles.list}>{children}</dl>
    </section>
  )
}

export function ReviewStep({ draft, steps, onEdit, onBack, onSubmit, submitting, submitError }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(declarationSchema),
    defaultValues: { declaration_accepted: draft.declaration_accepted ?? false },
  })

  const editHandler = (key) => {
    const index = steps.findIndex((s) => s.key === key)
    return index >= 0 ? () => onEdit(index) : undefined
  }

  const courses = draft._selected_courses ?? []
  const hasGuardian = Boolean(draft.guardian_full_name)

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <p className={styles.intro}>Review your details before submitting.</p>

      <Section title="Applicant" onEdit={editHandler('applicant')}>
        <Row label="Name" value={`${draft.first_name ?? ''} ${draft.last_name ?? ''}`.trim()} />
        <Row label="Birth date" value={formatDate(draft.birth_date)} />
        <Row label="Email" value={draft.email} />
        <Row label="Phone" value={draft.phone} />
        <Row
          label="Address"
          value={[draft.address_line, draft.city, draft.state_region, draft.country]
            .filter(Boolean)
            .join(', ')}
        />
        <Row label="Passport photo" value={draft.passport_photo?.name} />
      </Section>

      <Section title="Education" onEdit={editHandler('education')}>
        <Row label="Level" value={draft.education_level} />
        <Row label="Institution" value={draft.institution} />
        <Row
          label="Previous computer training"
          value={draft.previous_computer_training ? 'Yes' : 'No'}
        />
      </Section>

      {hasGuardian && (
        <Section title="Guardian" onEdit={editHandler('guardian')}>
          <Row label="Name" value={draft.guardian_full_name} />
          <Row label="Relationship" value={draft.guardian_relationship} />
          <Row label="Phone" value={draft.guardian_phone} />
        </Section>
      )}

      <Section title="Emergency contact" onEdit={editHandler('emergency')}>
        <Row label="Name" value={draft.emergency_name} />
        <Row label="Relationship" value={draft.emergency_relationship} />
        <Row label="Phone" value={draft.emergency_phone} />
      </Section>

      <Section title="Courses & schedule" onEdit={editHandler('courses')}>
        {courses.map((c) => (
          <Row key={c.id} label={c.name} value={formatMoney(c.fee)} />
        ))}
        <Row label="Preferred start" value={formatDate(draft.preferred_start_date)} />
        <Row label="Preferred session" value={draft.preferred_session} />
      </Section>

      <Section title="Additional" onEdit={editHandler('additional')}>
        <Row label="Computer access" value={draft.has_computer_access ? 'Yes' : 'No'} />
        <Row label="Reason for joining" value={draft.reason_for_joining} />
        <Row label="Referral source" value={draft.referral_source} />
      </Section>

      <Alert variant="info" className={styles.feeNote}>
        Fees and totals are confirmed by the school after review; amounts shown
        here are estimates.
      </Alert>

      {submitError && (
        <Alert variant="error" className={styles.feeNote} title="Couldn’t submit">
          {submitError}
        </Alert>
      )}

      <div className={styles.declaration}>
        <Checkbox
          label="I confirm that the information provided is true and complete to the best of my knowledge."
          error={errors.declaration_accepted?.message}
          {...register('declaration_accepted')}
        />
      </div>

      <div className={styles.footer}>
        <Button type="button" variant="secondary" onClick={onBack} disabled={submitting}>
          Back
        </Button>
        <Button type="submit" loading={submitting}>
          Submit application
        </Button>
      </div>
    </form>
  )
}
