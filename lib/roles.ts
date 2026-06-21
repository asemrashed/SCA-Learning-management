import { Role } from '@/types/api'

export function isSuperAdmin(role: Role): boolean {
  return role === Role.SUPER_ADMIN
}

export function isAdminStaff(role: Role): boolean {
  return role === Role.ADMIN || role === Role.SUPER_ADMIN
}

export function isStaff(role: Role): boolean {
  return isAdminStaff(role)
}

export function isLoginAllowed(role: Role): boolean {
  return true
}

export function canAccessAdminDashboard(role: Role): boolean {
  return role === Role.ADMIN
}

export function canAccessSuperAdminDashboard(role: Role): boolean {
  return role === Role.SUPER_ADMIN
}
