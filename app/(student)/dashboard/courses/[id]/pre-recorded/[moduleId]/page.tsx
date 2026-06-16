"use client"

import { use } from "react"
import { PreRecordedModuleLessons } from "@/features/enrollment/components/chapter-lesson-pages"

export default function PreRecordedModulePage({
  params,
}: {
  params: Promise<{ id: string; moduleId: string }>
}) {
  const { id, moduleId } = use(params)
  return <PreRecordedModuleLessons enrollmentId={id} moduleId={moduleId} />
}
