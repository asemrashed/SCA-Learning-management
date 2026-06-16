"use client"

import { use } from "react"
import { EnrollmentPlayer } from "@/features/enrollment/components/enrollment-player"
import { StudentPageShell } from "@/components/student/student-page-shell"

export default function CourseDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)

  return (
    <StudentPageShell title="Course Details">
      <EnrollmentPlayer enrollmentId={id} />
    </StudentPageShell>
  )
}
