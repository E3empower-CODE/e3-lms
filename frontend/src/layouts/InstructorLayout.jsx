import { LayoutDashboard, CalendarDays, ClipboardCheck, BookOpen } from 'lucide-react'
import { DashboardShell } from './DashboardShell'

const NAV = [
  { label: 'Dashboard', to: '/instructor', icon: LayoutDashboard, end: true },
  { label: 'My Classes', to: '/instructor/classes', icon: CalendarDays },
  { label: 'Attendance', to: '/instructor/attendance', icon: ClipboardCheck },
  { label: 'Coursework', to: '/instructor/coursework', icon: BookOpen },
]

export function InstructorLayout() {
  return <DashboardShell navItems={NAV} />
}
