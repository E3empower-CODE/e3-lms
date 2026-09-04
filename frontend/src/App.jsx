import { RouterProvider } from 'react-router-dom'
import { AuthProvider } from './features/auth/AuthProvider'
import { ErrorBoundary } from './components/ErrorBoundary/ErrorBoundary'
import { router } from './app/router'

/**
 * App root: global error boundary → auth session provider → router.
 * AuthProvider sits above the router so guards and pages can read the session.
 */
export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </ErrorBoundary>
  )
}
