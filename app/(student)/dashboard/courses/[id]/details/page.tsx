"use client"

import { use } from "react"
import { CourseDetailsOverview } from "@/features/enrollment/components/course-details-overview"
import { StudentPageShell } from "@/components/student/student-page-shell"

export default function CourseDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)

  return (
    <StudentPageShell title="Course Details">
      <CourseDetailsOverview enrollmentId={id} />
    </StudentPageShell>
  )
}
