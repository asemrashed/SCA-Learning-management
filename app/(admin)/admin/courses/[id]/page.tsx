"use client"

import { use } from "react"
import { CourseDashboardPreview } from "@/features/course/components/course-dashboard-preview"

export default function AdminCourseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <CourseDashboardPreview
        courseId={id}
        backHref="/admin/courses"
        backLabel="Manage courses"
        editHref={`/admin/courses/${id}/edit`}
      />
    </div>
  )
}
