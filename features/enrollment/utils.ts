import { EnrollmentKind } from '@/types/api'

export function enrollmentHubPath(_kind: EnrollmentKind, enrollmentId: string): string {
  return `/dashboard/courses/${enrollmentId}`
}

export function enrollmentPlayerPath(kind: EnrollmentKind, enrollmentId: string): string {
  return `${enrollmentHubPath(kind, enrollmentId)}/details`
}

export function enrollmentListPath(_kind: EnrollmentKind): string {
  return '/dashboard/courses'
}
