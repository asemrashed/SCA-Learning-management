"use client"

import { use } from "react"
import { CourseDashboardPreview } from "@/features/course/components/course-dashboard-preview"

export default function InstructorCourseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)

  return (
    <div className="p-6 md:p-8">
      <CourseDashboardPreview
        courseId={id}
        backHref="/instructor/courses"
        backLabel="My courses"
        editHref={`/admin/courses/${id}/edit`}
      />
    </div>
  )
}
