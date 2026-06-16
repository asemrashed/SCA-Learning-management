"use client"

import { useGetEnrollmentQuery } from "@/features/enrollment/api"
import { enrollmentProductId, enrollmentProductTitle } from "@/features/enrollment/curriculum"
import { AssignmentListPanel } from "@/features/assessment/components/assignment-list"
import { StudentPageShell } from "@/components/student/student-page-shell"

export function CourseAssignmentPage({ enrollmentId }: { enrollmentId: string }) {
  const { data, isLoading, error } = useGetEnrollmentQuery(enrollmentId)
  const enrollment = data?.data

  if (isLoading) {
    return (
      <StudentPageShell title="Assignment">
        <p className="text-muted-foreground">Loading…</p>
      </StudentPageShell>
    )
  }

  if (error || !enrollment) {
    return (
      <StudentPageShell title="Assignment">
        <p className="text-destructive">Course not found.</p>
      </StudentPageShell>
    )
  }

  const productId = enrollmentProductId(enrollment)
  const title = enrollmentProductTitle(enrollment)

  return (
    <StudentPageShell title={title}>
      <h1 className="mb-6 text-2xl font-bold">Assignment</h1>
      <AssignmentListPanel kind={enrollment.kind} scopeId={productId} />
    </StudentPageShell>
  )
}
