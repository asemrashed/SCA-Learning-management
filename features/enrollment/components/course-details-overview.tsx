"use client"

import { useGetEnrollmentQuery } from "@/features/enrollment/api"
import { enrollmentProductTitle } from "@/features/enrollment/curriculum"
import { StudentPageShell } from "@/components/student/student-page-shell"
import { EnrollmentKind } from "@/types/api"

export function CourseDetailsOverview({ enrollmentId }: { enrollmentId: string }) {
  const { data, isLoading, error } = useGetEnrollmentQuery(enrollmentId)
  const enrollment = data?.data

  if (isLoading) {
    return <p className="text-muted-foreground">Loading…</p>
  }

  if (error || !enrollment) {
    return <p className="text-destructive">Course not found.</p>
  }

  const title = enrollmentProductTitle(enrollment)
  const productLabel =
    enrollment.kind === EnrollmentKind.BATCH ? "Live batch" : "Recorded course"

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{productLabel}</p>
      </div>

      <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {enrollment.rollNumber ? (
          <div className="rounded-xl bg-muted/40 p-4">
            <dt className="text-sm text-muted-foreground">Roll number</dt>
            <dd className="font-semibold">{enrollment.rollNumber}</dd>
          </div>
        ) : null}
        <div className="rounded-xl bg-muted/40 p-4">
          <dt className="text-sm text-muted-foreground">Status</dt>
          <dd className="font-semibold">{enrollment.status}</dd>
        </div>
        <div className="rounded-xl bg-muted/40 p-4">
          <dt className="text-sm text-muted-foreground">Progress</dt>
          <dd className="font-semibold">{enrollment.progressPct}%</dd>
        </div>
        <div className="rounded-xl bg-muted/40 p-4">
          <dt className="text-sm text-muted-foreground">Enrollment</dt>
          <dd className="font-semibold capitalize">{enrollment.kind.toLowerCase()}</dd>
        </div>
      </dl>

      <p className="text-sm text-muted-foreground">
        Use the course menu to open live classes, recorded lessons, pre-recorded videos, exams,
        assignments, and other materials.
      </p>
    </div>
  )
}
