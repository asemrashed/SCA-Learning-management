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
  MessageSquareQuote,
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
      { href: '/dashboard/reviews', label: 'Review', icon: MessageSquareQuote },
    ],
  },
  {
    group: 'Account',
    items: [
      { href: '/dashboard/profile', label: 'Profile', icon: User },
      { href: '/dashboard/orders', label: 'My orders', icon: Package },
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
  { href: '/admin/reviews', label: 'Reviews', icon: MessageSquareQuote },
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
      { href: '/dashboard?studentView=1', label: 'Student view', icon: GraduationCap },
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
      { href: '/dashboard?studentView=1', label: 'Student view', icon: GraduationCap },
    ],
  },
]

export function homePathForRole(role: Role): string {
  switch (role) {
    case Role.SUPER_ADMIN:
      return '/super-admin'
    case Role.ADMIN:
      return '/admin'
    default:
      return '/dashboard'
  }
}

/** Post-login destination: honor ?next= only when it matches the signed-in role. */
export function resolvePostLoginRedirect(role: Role, nextParam: string | null): string {
  const roleHome = homePathForRole(role)
  if (!nextParam) return roleHome

  if (nextParam === '/dashboard' || nextParam.startsWith('/dashboard/')) {
    return role === Role.STUDENT ? nextParam : roleHome
  }

  if (nextParam.startsWith('/super-admin')) {
    return role === Role.SUPER_ADMIN ? nextParam : roleHome
  }

  if (nextParam.startsWith('/admin')) {
    return role === Role.SUPER_ADMIN || role === Role.ADMIN ? nextParam : roleHome
  }

  return nextParam
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
