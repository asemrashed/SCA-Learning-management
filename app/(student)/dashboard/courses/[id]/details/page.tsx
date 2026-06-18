"use client"

import { use } from "react"
import { CourseDetailsOverview } from "@/features/enrollment/components/course-details-overview"

export default function CourseDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  return <CourseDetailsOverview enrollmentId={id} />
}
