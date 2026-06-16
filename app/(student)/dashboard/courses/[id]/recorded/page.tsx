"use client"

import { use } from "react"
import { CoursePlaceholderPage } from "@/features/enrollment/components/course-placeholder-page"

export default function RecordedClassPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  return <CoursePlaceholderPage title="Recorded Class" />
}
