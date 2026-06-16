"use client"

import { use } from "react"
import { SubjectChapterPage } from "@/features/enrollment/components/subject-chapter-page"

export default function PreRecordedClassPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  return (
    <SubjectChapterPage
      enrollmentId={id}
      pageTitle="Prerecorded Video"
      lessonBasePath="pre-recorded"
    />
  )
}
