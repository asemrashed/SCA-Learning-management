import { EnrollmentKind } from '@/types/api'

export function enrollmentPlayerPath(kind: EnrollmentKind, enrollmentId: string): string {
  return kind === EnrollmentKind.BATCH
    ? `/dashboard/batches/${enrollmentId}`
    : `/dashboard/courses/${enrollmentId}`
}

export function enrollmentListPath(kind: EnrollmentKind): string {
  return kind === EnrollmentKind.BATCH ? '/dashboard/batches' : '/dashboard/courses'
}
