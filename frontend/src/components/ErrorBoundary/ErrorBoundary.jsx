import { Component } from 'react'
import { Alert } from '../Alert/Alert'
import styles from './ErrorBoundary.module.css'

/** Top-level boundary so a render error shows a message instead of a blank page. */
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    // eslint-disable-next-line no-console
    console.error('Uncaught error in UI:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className={styles.wrap}>
          <Alert variant="error" title="Something went wrong">
            <p>An unexpected error occurred. Reload the page to try again.</p>
          </Alert>
        </div>
      )
    }
    return this.props.children
  }
}
