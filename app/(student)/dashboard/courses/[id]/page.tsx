"use client"

import { use } from "react"
import { CourseHub } from "@/features/enrollment/components/course-hub"

export default function CourseHubPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  return <CourseHub enrollmentId={id} />
}
