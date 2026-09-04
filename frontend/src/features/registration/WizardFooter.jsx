import { Button } from '../../components/Button/Button'
import styles from './WizardFooter.module.css'

/** Back/Next control row shared by every wizard step. */
export function WizardFooter({
  onBack,
  canGoBack = true,
  nextLabel = 'Continue',
  loading = false,
}) {
  return (
    <div className={styles.footer}>
      <Button
        type="button"
        variant="secondary"
        onClick={onBack}
        disabled={!canGoBack}
      >
        Back
      </Button>
      <Button type="submit" loading={loading}>
        {nextLabel}
      </Button>
    </div>
  )
}
