"use client"

import { use } from "react"
import { ExamTakePage } from "@/features/assessment/components/exam-take-page"

export default function TakeExamRoute({
  params,
}: {
  params: Promise<{ examId: string }>
}) {
  const { examId } = use(params)
  return <ExamTakePage examId={examId} />
}
