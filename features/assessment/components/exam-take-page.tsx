"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useStartExamAttemptMutation } from "@/features/assessment/api"
import { ExamAttemptView } from "@/features/assessment/components/exam-attempt"
import type { ExamAttempt } from "@/types/api"

export function ExamTakePage({ examId }: { examId: string }) {
  const router = useRouter()
  const [startAttempt, { isLoading, error }] = useStartExamAttemptMutation()
  const [attempt, setAttempt] = useState<ExamAttempt | null>(null)

  useEffect(() => {
    startAttempt(examId)
      .unwrap()
      .then((res) => setAttempt(res.data))
      .catch(() => {
        /* conflict = already submitted — redirect back */
      })
  }, [examId, startAttempt])

  if (isLoading && !attempt) {
    return <p className="p-6 text-muted-foreground">Loading exam…</p>
  }

  if (error && !attempt) {
    return (
      <div className="space-y-4 p-6">
        <p className="text-destructive">Could not load this exam.</p>
        <Button variant="outline" onClick={() => router.back()}>
          Go back
        </Button>
      </div>
    )
  }

  if (!attempt) return null

  return (
    <div className="p-6 md:p-8">
      <ExamAttemptView initialAttempt={attempt} />
    </div>
  )
}
