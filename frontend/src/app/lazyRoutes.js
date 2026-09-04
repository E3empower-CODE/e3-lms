import { lazy } from 'react'

/**
 * Lazily-loaded feature routes. Kept in their own module so `router.jsx` does
 * not mix component definitions with its route-config export (react-refresh).
 * Splitting these moves recharts (admissions dashboard) and the registration
 * wizard into their own chunks.
 */
export const RegisterWizard = lazy(() =>
  import('../features/registration/RegisterWizard').then((m) => ({ default: m.RegisterWizard })),
)

export const AdmissionsDashboard = lazy(() =>
  import('../features/admissions/AdmissionsDashboard').then((m) => ({ default: m.AdmissionsDashboard })),
)

export const ApplicationsList = lazy(() =>
  import('../features/admissions/ApplicationsList').then((m) => ({ default: m.ApplicationsList })),
)

export const ApplicationDetail = lazy(() =>
  import('../features/admissions/ApplicationDetail').then((m) => ({ default: m.ApplicationDetail })),
)
