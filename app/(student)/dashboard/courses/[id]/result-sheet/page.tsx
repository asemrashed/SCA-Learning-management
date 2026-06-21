"use client"

import { use } from "react"
import { StudentAssessmentResults } from "@/features/resource-submission/components/student-assessment-results"

export default function ResultSheetPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  return <StudentAssessmentResults enrollmentId={id} />
}
