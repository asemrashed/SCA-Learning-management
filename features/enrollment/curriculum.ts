import type { EnrollmentDetail, EnrollmentModule, EnrollmentSubject } from "@/types/api"
import { EnrollmentKind } from "@/types/api"

/** Normalize batch subjects or wrap recorded-course modules as a single subject group. */
export function getEnrollmentSubjects(detail: EnrollmentDetail): EnrollmentSubject[] {
  if (detail.kind === EnrollmentKind.BATCH && detail.subjects?.length) {
    return [...detail.subjects].sort((a, b) => a.order - b.order)
  }
  if (detail.modules?.length) {
    const title =
      detail.kind === EnrollmentKind.BATCH
        ? detail.batch?.title ?? "Course"
        : detail.course?.title ?? "Course"
    return [
      {
        id: "__course__",
        title,
        order: 0,
        modules: [...detail.modules].sort((a, b) => a.order - b.order),
      },
    ]
  }
  return []
}

export function getModulesForSubject(
  detail: EnrollmentDetail,
  subjectId: string,
): EnrollmentModule[] {
  const subject = getEnrollmentSubjects(detail).find((s) => s.id === subjectId)
  return subject?.modules ?? []
}

export function findModuleInEnrollment(
  detail: EnrollmentDetail,
  moduleId: string,
): EnrollmentModule | null {
  for (const subject of getEnrollmentSubjects(detail)) {
    const mod = subject.modules.find((m) => m.id === moduleId)
    if (mod) return mod
  }
  return null
}

export function findSubjectForModule(
  detail: EnrollmentDetail,
  moduleId: string,
): EnrollmentSubject | null {
  for (const subject of getEnrollmentSubjects(detail)) {
    if (subject.modules.some((m) => m.id === moduleId)) return subject
  }
  return null
}

export function enrollmentCourseId(detail: EnrollmentDetail): string {
  if (detail.kind === EnrollmentKind.COURSE) {
    return detail.course!.id
  }
  return detail.batch!.courseId ?? detail.course!.id
}

export function enrollmentProductTitle(detail: EnrollmentDetail): string {
  return detail.kind === EnrollmentKind.BATCH
    ? detail.batch!.title
    : detail.course!.title
}

export function enrollmentProductId(detail: EnrollmentDetail): string {
  return detail.kind === EnrollmentKind.BATCH ? detail.batch!.id : detail.course!.id
}
