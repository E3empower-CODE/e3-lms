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

export const StudentsList = lazy(() =>
  import('../features/students/StudentsList').then((m) => ({ default: m.StudentsList })),
)

export const StudentDetail = lazy(() =>
  import('../features/students/StudentDetail').then((m) => ({ default: m.StudentDetail })),
)

export const StudentDashboard = lazy(() =>
  import('../features/student/StudentDashboard').then((m) => ({ default: m.StudentDashboard })),
)

export const MyCourses = lazy(() =>
  import('../features/student/MyCourses').then((m) => ({ default: m.MyCourses })),
)

export const CourseDetail = lazy(() =>
  import('../features/student/CourseDetail').then((m) => ({ default: m.CourseDetail })),
)

export const LessonViewer = lazy(() =>
  import('../features/student/LessonViewer').then((m) => ({ default: m.LessonViewer })),
)

export const InstructorDashboard = lazy(() =>
  import('../features/instructor/InstructorDashboard').then((m) => ({ default: m.InstructorDashboard })),
)

export const MyClasses = lazy(() =>
  import('../features/instructor/MyClasses').then((m) => ({ default: m.MyClasses })),
)

export const ClassDetail = lazy(() =>
  import('../features/instructor/ClassDetail').then((m) => ({ default: m.ClassDetail })),
)

export const AssignmentsList = lazy(() =>
  import('../features/coursework/AssignmentsList').then((m) => ({ default: m.AssignmentsList })),
)

export const AssignmentDetail = lazy(() =>
  import('../features/coursework/AssignmentDetail').then((m) => ({ default: m.AssignmentDetail })),
)

export const AssessmentsList = lazy(() =>
  import('../features/coursework/AssessmentsList').then((m) => ({ default: m.AssessmentsList })),
)

export const AssessmentAttempt = lazy(() =>
  import('../features/coursework/AssessmentAttempt').then((m) => ({ default: m.AssessmentAttempt })),
)

export const AssignmentGrading = lazy(() =>
  import('../features/instructor/AssignmentGrading').then((m) => ({ default: m.AssignmentGrading })),
)

export const AssessmentResults = lazy(() =>
  import('../features/instructor/AssessmentResults').then((m) => ({ default: m.AssessmentResults })),
)

export const AttendanceClassPicker = lazy(() =>
  import('../features/instructor/AttendanceClassPicker').then((m) => ({ default: m.AttendanceClassPicker })),
)

export const ResultsProgress = lazy(() =>
  import('../features/student/ResultsProgress').then((m) => ({ default: m.ResultsProgress })),
)
