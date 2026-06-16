"use client"

import { use } from "react"
import { SubjectChapterPage } from "@/features/enrollment/components/subject-chapter-page"

export default function RecordedClassPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  return (
    <SubjectChapterPage
      enrollmentId={id}
      pageTitle="Recorded Class Video"
      lessonBasePath="recorded"
    />
  )
}
