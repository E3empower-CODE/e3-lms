import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Card } from '../../components/Card/Card'
import { Stepper } from './Stepper'
import { ApplicantStep } from './steps/ApplicantStep'
import { EducationStep } from './steps/EducationStep'
import { GuardianStep } from './steps/GuardianStep'
import { EmergencyStep } from './steps/EmergencyStep'
import { CoursesStep } from './steps/CoursesStep'
import { AdditionalStep } from './steps/AdditionalStep'
import { ReviewStep } from './steps/ReviewStep'
import { RegistrationSuccess } from './RegistrationSuccess'
import { submitApplication } from './registrationApi'
import { isMinor } from './age'
import styles from './RegisterWizard.module.css'

const STEP_COMPONENTS = {
  applicant: ApplicantStep,
  education: EducationStep,
  guardian: GuardianStep,
  emergency: EmergencyStep,
  courses: CoursesStep,
  additional: AdditionalStep,
  review: ReviewStep,
}

/**
 * Public multi-step registration. Draft state lives in memory (not persisted),
 * per PLAN.md. The guardian step is included only when the applicant's birth
 * date makes them a minor; the server re-evaluates age and fees on submit.
 */
export function RegisterWizard() {
  const [draft, setDraft] = useState({})
  const [index, setIndex] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [result, setResult] = useState(null)

  const steps = useMemo(() => {
    const base = [
      { key: 'applicant', label: 'Applicant' },
      { key: 'education', label: 'Education' },
      { key: 'guardian', label: 'Guardian' },
      { key: 'emergency', label: 'Emergency' },
      { key: 'courses', label: 'Courses' },
      { key: 'additional', label: 'Details' },
      { key: 'review', label: 'Review' },
    ]
    return isMinor(draft.birth_date)
      ? base
      : base.filter((s) => s.key !== 'guardian')
  }, [draft.birth_date])

  // Keep the index valid if the step list shrank (e.g. birth date changed).
  const safeIndex = Math.min(index, steps.length - 1)
  const step = steps[safeIndex]
  const StepComponent = STEP_COMPONENTS[step.key]

  const handleNext = (values) => {
    setDraft((prev) => ({ ...prev, ...values }))
    setIndex((i) => Math.min(i + 1, steps.length - 1))
    window.scrollTo({ top: 0 })
  }

  const handleBack = () => {
    setIndex((i) => Math.max(i - 1, 0))
    window.scrollTo({ top: 0 })
  }

  const handleEdit = (targetIndex) => {
    setIndex(targetIndex)
    window.scrollTo({ top: 0 })
  }

  const handleSubmit = async (declaration) => {
    setSubmitting(true)
    setSubmitError(null)
    const finalDraft = { ...draft, ...declaration }
    setDraft(finalDraft)
    try {
      const data = await submitApplication(finalDraft)
      setResult(data)
    } catch (err) {
      setSubmitError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (result) {
    return <RegistrationSuccess result={result} />
  }

  const isReview = step.key === 'review'

  return (
    <div className={styles.wrap}>
      <div className={styles.head}>
        <h1 className={styles.title}>Register</h1>
        <p className={styles.subtitle}>
          Already have an account?{' '}
          <Link className={styles.link} to="/login">
            Sign in
          </Link>
        </p>
      </div>

      <Card className={styles.card}>
        <Stepper steps={steps} current={safeIndex} />
        <StepComponent
          draft={draft}
          steps={steps}
          onNext={handleNext}
          onBack={handleBack}
          canGoBack={safeIndex > 0}
          onEdit={handleEdit}
          onSubmit={isReview ? handleSubmit : undefined}
          submitting={submitting}
          submitError={submitError}
        />
      </Card>
    </div>
  )
}
