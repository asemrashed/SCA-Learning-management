import type { EnrollmentDetail, EnrollmentModule, EnrollmentSubject } from "@/types/api"
import { EnrollmentKind } from "@/types/api"

/** Own-batch curriculum (recorded class path for live enrollments). */
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

/** Granted previous-batch curriculum (pre-recorded class path). */
export function getGrantedEnrollmentSubjects(detail: EnrollmentDetail): EnrollmentSubject[] {
  if (!detail.grantedSubjects?.length) return []
  return [...detail.grantedSubjects].sort((a, b) => a.order - b.order)
}

export function getModulesForSubject(
  detail: EnrollmentDetail,
  subjectId: string,
  source: "own" | "granted" = "own",
): EnrollmentModule[] {
  const subjects = source === "granted" ? getGrantedEnrollmentSubjects(detail) : getEnrollmentSubjects(detail)
  const subject = subjects.find((s) => s.id === subjectId)
  return subject?.modules ?? []
}

export function findModuleInEnrollment(
  detail: EnrollmentDetail,
  moduleId: string,
  source: "own" | "granted" = "own",
): EnrollmentModule | null {
  const subjects = source === "granted" ? getGrantedEnrollmentSubjects(detail) : getEnrollmentSubjects(detail)
  for (const subject of subjects) {
    const mod = subject.modules.find((m) => m.id === moduleId)
    if (mod) return mod
  }
  return null
}

export function findSubjectForModule(
  detail: EnrollmentDetail,
  moduleId: string,
  source: "own" | "granted" = "own",
): EnrollmentSubject | null {
  const subjects = source === "granted" ? getGrantedEnrollmentSubjects(detail) : getEnrollmentSubjects(detail)
  for (const subject of subjects) {
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

export function enrollmentBatchId(detail: EnrollmentDetail): string | null {
  return detail.kind === EnrollmentKind.BATCH ? detail.batch?.id ?? null : null
}
