"use client"

import { use } from "react"
import { CourseResourcePage } from "@/features/resource/components/course-resource-page"
import { ResourceCategory } from "@/types/api"

export default function AssignmentPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  return (
    <CourseResourcePage
      enrollmentId={id}
      category={ResourceCategory.ASSIGNMENT}
      pageTitle="Assignment"
    />
  )
}
