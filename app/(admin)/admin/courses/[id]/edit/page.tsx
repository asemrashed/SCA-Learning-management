"use client"

import { use } from "react"
import { CourseAdminForm } from "@/features/course/components/course-admin-form"

export default function EditCoursePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  return (
    <div className="px-4 py-10">
      <CourseAdminForm courseId={id} />
    </div>
  )
}
