import { Suspense } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import { PublicLayout } from '../layouts/PublicLayout'
import { AdminLayout } from '../layouts/AdminLayout'
import { InstructorLayout } from '../layouts/InstructorLayout'
import { StudentLayout } from '../layouts/StudentLayout'
import { ProtectedRoute } from '../routes/ProtectedRoute'
import { RoleRoute } from '../routes/RoleRoute'
import { NotFound } from '../routes/NotFound'
import { LoginPage } from '../features/auth/LoginPage'
import { ForgotPasswordPage } from '../features/auth/ForgotPasswordPage'
import { ResetPasswordPage } from '../features/auth/ResetPasswordPage'
import { ChangePasswordPage } from '../features/auth/ChangePasswordPage'
import { PlaceholderPage } from '../components/PlaceholderPage/PlaceholderPage'
import { Spinner } from '../components/Spinner/Spinner'
import { RootRedirect } from './RootRedirect'
import {
  RegisterWizard,
  AdmissionsDashboard,
  ApplicationsList,
  ApplicationDetail,
  StudentsList,
  StudentDetail,
  StudentDashboard,
  MyCourses,
  CourseDetail,
  LessonViewer,
  InstructorDashboard,
  MyClasses,
  ClassDetail,
  AssignmentsList,
  AssignmentDetail,
  AssessmentsList,
  AssessmentAttempt,
  AssignmentGrading,
  AssessmentResults,
  AttendanceClassPicker,
  ResultsProgress,
  PaymentsList,
  StudentPayments,
} from './lazyRoutes'
import { ROLES, ADMIN_ROLES } from '../lib/roles'

const lazyEl = (node) => (
  <Suspense fallback={<Spinner label="Loading…" />}>{node}</Suspense>
)

const placeholder = (title, phase) => ({
  element: <PlaceholderPage title={title} phase={phase} />,
})

export const router = createBrowserRouter([
  { path: '/', element: <RootRedirect /> },
  {
    element: <PublicLayout />,
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: lazyEl(<RegisterWizard />) },
      { path: '/forgot-password', element: <ForgotPasswordPage /> },
      { path: '/reset-password', element: <ResetPasswordPage /> },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      // Available to any authenticated user, independent of role/shell.
      { path: '/account/password', element: <ChangePasswordPage /> },
      {
        element: <RoleRoute allow={ADMIN_ROLES} />,
        children: [
          {
            path: '/admin',
            element: <AdminLayout />,
            children: [
              { index: true, element: lazyEl(<AdmissionsDashboard />) },
              { path: 'applications', element: lazyEl(<ApplicationsList />) },
              { path: 'applications/:id', element: lazyEl(<ApplicationDetail />) },
              { path: 'students', element: lazyEl(<StudentsList />) },
              { path: 'students/:id', element: lazyEl(<StudentDetail />) },
              { path: 'classes', ...placeholder('Classes', 'Phase 3') },
              { path: 'enrollments', ...placeholder('Enrollments', 'Phase 3') },
              { path: 'payments', element: lazyEl(<PaymentsList />) },
            ],
          },
        ],
      },
      {
        element: <RoleRoute allow={[ROLES.INSTRUCTOR]} />,
        children: [
          {
            path: '/instructor',
            element: <InstructorLayout />,
            children: [
              { index: true, element: lazyEl(<InstructorDashboard />) },
              { path: 'classes', element: lazyEl(<MyClasses />) },
              { path: 'classes/:id', element: lazyEl(<ClassDetail />) },
              {
                path: 'assignments/:id/grade',
                element: lazyEl(<AssignmentGrading />),
              },
              {
                path: 'assessments/:id/results',
                element: lazyEl(<AssessmentResults />),
              },
              { path: 'attendance', element: lazyEl(<AttendanceClassPicker />) },
              { path: 'coursework', ...placeholder('Coursework', 'Phase 7') },
            ],
          },
        ],
      },
      {
        element: <RoleRoute allow={[ROLES.STUDENT]} />,
        children: [
          {
            path: '/student',
            element: <StudentLayout />,
            children: [
              { index: true, element: lazyEl(<StudentDashboard />) },
              { path: 'courses', element: lazyEl(<MyCourses />) },
              { path: 'courses/:id', element: lazyEl(<CourseDetail />) },
              {
                path: 'courses/:id/lessons/:lessonId',
                element: lazyEl(<LessonViewer />),
              },
              { path: 'assignments', element: lazyEl(<AssignmentsList />) },
              { path: 'assignments/:id', element: lazyEl(<AssignmentDetail />) },
              { path: 'assessments', element: lazyEl(<AssessmentsList />) },
              { path: 'assessments/:id', element: lazyEl(<AssessmentAttempt />) },
              { path: 'results', element: lazyEl(<ResultsProgress />) },
              { path: 'payments', element: lazyEl(<StudentPayments />) },
              { path: 'certificates', ...placeholder('Certificates', 'Phase 10') },
            ],
          },
        ],
      },
    ],
  },
  { path: '*', element: <NotFound /> },
])
