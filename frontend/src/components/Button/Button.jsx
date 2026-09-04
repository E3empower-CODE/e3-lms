import styles from './Button.module.css'
import { Spinner } from '../Spinner/Spinner'

/**
 * Button primitive.
 * @param {'primary'|'secondary'|'ghost'|'danger'} [variant]
 */
export function Button({
  variant = 'primary',
  type = 'button',
  loading = false,
  disabled = false,
  className = '',
  children,
  ...rest
}) {
  return (
    <button
      type={type}
      className={`${styles.button} ${styles[variant]} ${className}`.trim()}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading && <Spinner size={16} label="" inline />}
      <span>{children}</span>
    </button>
  )
}
