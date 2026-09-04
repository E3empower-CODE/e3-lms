import {
  LayoutDashboard,
  FileText,
  Users,
  CalendarDays,
  GraduationCap,
  Wallet,
  Award,
  BarChart3,
} from 'lucide-react'
import { DashboardShell } from './DashboardShell'

const NAV = [
  { label: 'Dashboard', to: '/admin', icon: LayoutDashboard, end: true },
  { label: 'Applications', to: '/admin/applications', icon: FileText },
  { label: 'Students', to: '/admin/students', icon: Users },
  { label: 'Classes', to: '/admin/classes', icon: CalendarDays },
  { label: 'Enrollments', to: '/admin/enrollments', icon: GraduationCap },
  { label: 'Payments', to: '/admin/payments', icon: Wallet },
  { label: 'Certificates', to: '/admin/certificates', icon: Award },
  { label: 'Reports', to: '/admin/reports', icon: BarChart3 },
]

export function AdminLayout() {
  return <DashboardShell navItems={NAV} />
}
