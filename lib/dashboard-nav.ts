import type { LucideIcon } from 'lucide-react'
import {
  Calendar,
  ClipboardList,
  CreditCard,
  FileText,
  GraduationCap,
  Layers,
  LayoutDashboard,
  LayoutGrid,
  Package,
  PenLine,
  ShoppingBag,
  User,
  UserPlus,
  Users,
} from 'lucide-react'
import { Role } from '@/types/api'
import {
  BATCHES,
  COURSES,
  MY_COURSES,
} from '@/lib/product-vocabulary'

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
      { href: '/dashboard/courses', label: MY_COURSES, icon: Layers },
      { href: '/dashboard/resources', label: 'Resources', icon: FileText },
    ],
  },
  {
    group: 'Account',
    items: [
      { href: '/dashboard/profile', label: 'Profile', icon: User },
      { href: '/dashboard/orders', label: 'My orders', icon: Package },
      { href: '/dashboard/certificates', label: 'Certificates', icon: GraduationCap },
    ],
  },
]

const adminOperationsNav: ShellNavItem[] = [
  { href: '/admin/courses', label: COURSES, icon: Layers },
  { href: '/admin/categories', label: 'Categories', icon: LayoutGrid },
  { href: '/admin/batches', label: BATCHES, icon: Calendar },
  { href: '/admin/products', label: 'Shop products', icon: ShoppingBag },
  { href: '/admin/orders', label: 'Shop orders', icon: Package },
  { href: '/admin/enrollments', label: 'Enrollments', icon: UserPlus },
  { href: '/admin/payments', label: 'Payments', icon: CreditCard },
  { href: '/admin/resources', label: 'Resources', icon: FileText },
  { href: '/admin/exams', label: 'Exams', icon: ClipboardList },
  { href: '/admin/assignments', label: 'Assignments', icon: PenLine },
  { href: '/admin/questions', label: 'Question bank', icon: ClipboardList },
  { href: '/admin/certificates', label: 'Certificates', icon: GraduationCap },
]

export const adminShellNav: ShellNavGroup[] = [
  {
    group: 'Admin',
    items: [
      { href: '/admin', label: 'Overview', icon: LayoutDashboard },
      ...adminOperationsNav,
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

export const superAdminShellNav: ShellNavGroup[] = [
  {
    group: 'Platform',
    items: [
      { href: '/super-admin', label: 'Overview', icon: LayoutDashboard },
      { href: '/super-admin/users', label: 'Admins', icon: Users },
    ],
  },
  {
    group: 'Admin',
    items: adminOperationsNav,
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
      { href: '/instructor/batches', label: MY_COURSES, icon: Layers },
      { href: '/instructor/payments', label: 'Payments', icon: CreditCard },
      { href: '/instructor/resources', label: 'Resources', icon: FileText },
      { href: '/instructor/exams', label: 'Exams', icon: ClipboardList },
      { href: '/instructor/assignments', label: 'Assignments', icon: PenLine },
      { href: '/instructor/certificates', label: 'Certificates', icon: GraduationCap },
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
    case Role.SUPER_ADMIN:
      return '/super-admin'
    case Role.ADMIN:
      return '/admin'
    case Role.INSTRUCTOR:
      return '/instructor'
    default:
      return '/dashboard'
  }
}

const staffOverviewHrefs = new Set(['/admin', '/super-admin'])

/** Sidebar destinations shown as linked cards on the staff dashboard overview. */
export function staffDashboardLinkItems(variant: 'admin' | 'super-admin'): ShellNavItem[] {
  const nav = variant === 'super-admin' ? superAdminShellNav : adminShellNav
  return nav
    .filter((group) => group.group !== 'Account')
    .flatMap((group) => group.items)
    .filter((item) => !staffOverviewHrefs.has(item.href))
}
