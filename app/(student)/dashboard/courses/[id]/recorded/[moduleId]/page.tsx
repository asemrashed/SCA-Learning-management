"use client"

import { use } from "react"
import { RecordedModuleLessons } from "@/features/enrollment/components/chapter-lesson-pages"

export default function RecordedModulePage({
  params,
}: {
  params: Promise<{ id: string; moduleId: string }>
}) {
  const { id, moduleId } = use(params)
  return <RecordedModuleLessons enrollmentId={id} moduleId={moduleId} />
}
