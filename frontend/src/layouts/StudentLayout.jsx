import {
  LayoutDashboard,
  BookOpen,
  FileText,
  ClipboardCheck,
  ClipboardList,
  Wallet,
  Award,
} from 'lucide-react'
import { DashboardShell } from './DashboardShell'

const NAV = [
  { label: 'Dashboard', to: '/student', icon: LayoutDashboard, end: true },
  { label: 'My Courses', to: '/student/courses', icon: BookOpen },
  { label: 'Assignments', to: '/student/assignments', icon: FileText },
  { label: 'Assessments', to: '/student/assessments', icon: ClipboardCheck },
  { label: 'Results', to: '/student/results', icon: ClipboardList },
  { label: 'Payments', to: '/student/payments', icon: Wallet },
  { label: 'Certificates', to: '/student/certificates', icon: Award },
]

export function StudentLayout() {
  return <DashboardShell navItems={NAV} />
}
