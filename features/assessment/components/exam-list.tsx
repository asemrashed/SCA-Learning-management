"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  useListBatchExamsQuery,
  useListCourseExamsQuery,
  useStartExamAttemptMutation,
} from "@/features/assessment/api"
import { AttemptStatus, EnrollmentKind } from "@/types/api"

export function ExamListPanel({
  kind,
  scopeId,
}: {
  kind: EnrollmentKind
  scopeId: string
}) {
  const router = useRouter()
  const batchQuery = useListBatchExamsQuery(scopeId, {
    skip: kind !== EnrollmentKind.BATCH,
  })
  const courseQuery = useListCourseExamsQuery(scopeId, {
    skip: kind !== EnrollmentKind.COURSE,
  })
  const [startAttempt, { isLoading: starting }] = useStartExamAttemptMutation()

  const { data, isLoading, error } =
    kind === EnrollmentKind.BATCH ? batchQuery : courseQuery
  const exams = data?.data ?? []

  async function handleStart(examId: string) {
    await startAttempt(examId).unwrap()
    router.push(`/dashboard/exams/take/${examId}`)
  }

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading exams…</p>
  if (error) return <p className="text-sm text-destructive">Could not load exams.</p>
  if (!exams.length) {
    return <p className="text-sm text-muted-foreground">No exams available yet.</p>
  }

  return (
    <ul className="space-y-3">
      {exams.map((exam) => {
        const submitted = exam.attempt?.status === AttemptStatus.SUBMITTED
        const inProgress = exam.attempt?.status === AttemptStatus.IN_PROGRESS
        return (
          <li
            key={exam.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-4"
          >
            <div>
              <p className="font-medium">{exam.title}</p>
              <p className="text-xs text-muted-foreground">
                {exam.questionCount} questions · {exam.totalMarks} marks
                {exam.durationMin ? ` · ${exam.durationMin} min` : ""}
              </p>
              {submitted ? (
                <p className="mt-1 text-sm font-medium text-green-700">
                  Score: {exam.attempt?.scorePct ?? 0}% ({exam.attempt?.scoreMarks ?? 0} marks)
                </p>
              ) : null}
            </div>
            {submitted ? null : inProgress ? (
              <Button size="sm" asChild>
                <Link href={`/dashboard/exams/take/${exam.id}`}>Continue</Link>
              </Button>
            ) : (
              <Button
                size="sm"
                disabled={starting}
                onClick={() => void handleStart(exam.id)}
              >
                Start exam
              </Button>
            )}
          </li>
        )
      })}
    </ul>
  )
}
