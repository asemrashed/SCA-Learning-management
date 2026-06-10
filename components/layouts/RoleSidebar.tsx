import { Role } from '@/types/api'

export interface NavItem {
  href: string
  label: string
}

const studentNav: NavItem[] = [
  { href: '/dashboard', label: 'Overview' },
  { href: '/dashboard/courses', label: 'My Courses' },
  { href: '/dashboard/recordings', label: 'Recordings' },
  { href: '/dashboard/resources', label: 'Resources' },
]

const instructorNav: NavItem[] = [{ href: '/instructor', label: 'Dashboard' }]

const adminNav: NavItem[] = [{ href: '/admin', label: 'Dashboard' }]

export function getNavForRole(role: Role): NavItem[] {
  switch (role) {
    case Role.INSTRUCTOR:
      return instructorNav
    case Role.ADMIN:
      return adminNav
    default:
      return studentNav
  }
}
