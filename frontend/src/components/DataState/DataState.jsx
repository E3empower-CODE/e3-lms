import { Spinner } from '../Spinner/Spinner'
import { Alert } from '../Alert/Alert'
import { Button } from '../Button/Button'
import { EmptyState } from '../EmptyState/EmptyState'
import styles from './DataState.module.css'

/**
 * Renders the four required data-states so async views never fall through to a
 * blank screen or an unguarded `.map`.
 *
 * @param {'loading'|'error'|'success'} status
 * @param {object|null} error   normalized ApiError
 * @param {boolean} isEmpty
 * @param {() => void} [onRetry]
 * @param {object} [empty]      props forwarded to EmptyState
 */
export function DataState({
  status,
  error,
  isEmpty = false,
  onRetry,
  empty,
  children,
}) {
  if (status === 'loading') {
    return <Spinner label="Loading…" />
  }

  if (status === 'error') {
    return (
      <Alert variant="error" title="Couldn’t load this content">
        <p>{error?.message || 'Please try again.'}</p>
        {onRetry && (
          <div className={styles.retry}>
            <Button variant="secondary" onClick={onRetry}>
              Retry
            </Button>
          </div>
        )}
      </Alert>
    )
  }

  if (isEmpty) {
    return <EmptyState {...empty} />
  }

  return children
}
