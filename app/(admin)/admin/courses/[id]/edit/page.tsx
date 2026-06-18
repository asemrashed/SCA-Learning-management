"use client"

import { Suspense, use } from "react"
import { CourseAdminForm } from "@/features/course/components/course-admin-form"

export default function AdminEditCoursePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  return (
    <div className="px-4 py-10">
      <Suspense fallback={<p className="text-muted-foreground">Loading course…</p>}>
        <CourseAdminForm courseId={id} />
      </Suspense>
    </div>
  )
}
