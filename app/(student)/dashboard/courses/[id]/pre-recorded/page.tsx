"use client"

import { use } from "react"
import { CoursePlaceholderPage } from "@/features/enrollment/components/course-placeholder-page"

export default function PreRecordedPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  return <CoursePlaceholderPage title="Pre-Recorded Class" />
}
