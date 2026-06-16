"use client"

import { use } from "react"
import { CourseResourcePage } from "@/features/resource/components/course-resource-page"
import { ResourceCategory } from "@/types/api"

export default function ExamPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  return (
    <CourseResourcePage
      enrollmentId={id}
      category={ResourceCategory.EXAM}
      pageTitle="Exam"
    />
  )
}
