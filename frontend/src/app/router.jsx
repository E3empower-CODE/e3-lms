import { createBrowserRouter } from 'react-router-dom'
import { PublicLayout } from '../layouts/PublicLayout'
import { AdminLayout } from '../layouts/AdminLayout'
import { InstructorLayout } from '../layouts/InstructorLayout'
import { StudentLayout } from '../layouts/StudentLayout'
import { ProtectedRoute } from '../routes/ProtectedRoute'
import { RoleRoute } from '../routes/RoleRoute'
import { NotFound } from '../routes/NotFound'
import { LoginPage } from '../features/auth/LoginPage'
import { RoleDashboard } from '../features/dashboard/RoleDashboard'
import { PlaceholderPage } from '../components/PlaceholderPage/PlaceholderPage'
import { RootRedirect } from './RootRedirect'
import { ROLES, ADMIN_ROLES } from '../lib/roles'

const placeholder = (title, phase) => ({
  element: <PlaceholderPage title={title} phase={phase} />,
})

export const router = createBrowserRouter([
  { path: '/', element: <RootRedirect /> },
  {
    element: <PublicLayout />,
    children: [{ path: '/login', element: <LoginPage /> }],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <RoleRoute allow={ADMIN_ROLES} />,
        children: [
          {
            path: '/admin',
            element: <AdminLayout />,
            children: [
              { index: true, element: <RoleDashboard scope="admissions" /> },
              { path: 'applications', ...placeholder('Applications', 'Phase 3') },
              { path: 'students', ...placeholder('Students', 'Phase 5') },
              { path: 'classes', ...placeholder('Classes', 'Phase 3') },
              { path: 'enrollments', ...placeholder('Enrollments', 'Phase 3') },
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
              { index: true, element: <RoleDashboard scope="instructor" /> },
              { path: 'classes', ...placeholder('My Classes', 'Phase 6') },
              { path: 'attendance', ...placeholder('Attendance', 'Phase 8') },
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
              { index: true, element: <RoleDashboard scope="student" /> },
              { path: 'courses', ...placeholder('My Courses', 'Phase 5') },
              { path: 'results', ...placeholder('Results', 'Phase 7') },
              { path: 'payments', ...placeholder('Payments', 'Phase 9') },
              { path: 'certificates', ...placeholder('Certificates', 'Phase 10') },
            ],
          },
        ],
      },
    ],
  },
  { path: '*', element: <NotFound /> },
])
