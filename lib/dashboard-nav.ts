import type { LucideIcon } from 'lucide-react'
import {
  BookOpen,
  FileText,
  GraduationCap,
  Layers,
  LayoutDashboard,
  Settings,
  User,
  Video,
} from 'lucide-react'
import { Role } from '@/types/api'

export interface ShellNavItem {
  href: string
  label: string
  icon: LucideIcon
}

export interface ShellNavGroup {
  group: string
  items: ShellNavItem[]
}

export const studentShellNav: ShellNavGroup[] = [
  {
    group: 'Learning',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/dashboard/courses', label: 'My Courses', icon: BookOpen },
      { href: '/dashboard/recordings', label: 'Recordings', icon: Video },
      { href: '/dashboard/resources', label: 'Resources', icon: FileText },
    ],
  },
  {
    group: 'Account',
    items: [
      { href: '/profile', label: 'Profile', icon: User },
      { href: '/dashboard/certificates', label: 'Certificates', icon: GraduationCap },
      { href: '/dashboard/settings', label: 'Settings', icon: Settings },
    ],
  },
]

export const adminShellNav: ShellNavGroup[] = [
  {
    group: 'Admin',
    items: [
      { href: '/admin', label: 'Overview', icon: LayoutDashboard },
      { href: '/admin/courses', label: 'Courses', icon: BookOpen },
      { href: '/admin/batches', label: 'Batches', icon: Layers },
    ],
  },
  {
    group: 'Account',
    items: [
      { href: '/profile', label: 'Profile', icon: User },
      { href: '/dashboard', label: 'Student view', icon: GraduationCap },
    ],
  },
]

export const instructorShellNav: ShellNavGroup[] = [
  {
    group: 'Teaching',
    items: [
      { href: '/instructor', label: 'Overview', icon: LayoutDashboard },
      { href: '/instructor/batches', label: 'My Batches', icon: Layers },
      { href: '/instructor/courses', label: 'My Courses', icon: BookOpen },
    ],
  },
  {
    group: 'Account',
    items: [
      { href: '/profile', label: 'Profile', icon: User },
      { href: '/dashboard', label: 'Student view', icon: GraduationCap },
    ],
  },
]

export function homePathForRole(role: Role): string {
  switch (role) {
    case Role.ADMIN:
      return '/admin'
    case Role.INSTRUCTOR:
      return '/instructor'
    default:
      return '/dashboard'
  }
}
