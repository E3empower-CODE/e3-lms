import { LayoutDashboard, FileText, Users, CalendarDays, GraduationCap } from 'lucide-react'
import { DashboardShell } from './DashboardShell'

const NAV = [
  { label: 'Dashboard', to: '/admin', icon: LayoutDashboard, end: true },
  { label: 'Applications', to: '/admin/applications', icon: FileText },
  { label: 'Students', to: '/admin/students', icon: Users },
  { label: 'Classes', to: '/admin/classes', icon: CalendarDays },
  { label: 'Enrollments', to: '/admin/enrollments', icon: GraduationCap },
]

export function AdminLayout() {
  return <DashboardShell navItems={NAV} />
}
