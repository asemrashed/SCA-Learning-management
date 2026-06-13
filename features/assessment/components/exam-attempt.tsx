"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useUpdateExamAttemptMutation } from "@/features/assessment/api"
import { AttemptStatus, QuestionType, type ExamAttempt } from "@/types/api"

function formatRemaining(expiresAt: string | null): string {
  if (!expiresAt) return ""
  const ms = new Date(expiresAt).getTime() - Date.now()
  if (ms <= 0) return "Time expired"
  const min = Math.floor(ms / 60000)
  const sec = Math.floor((ms % 60000) / 1000)
  return `${min}:${sec.toString().padStart(2, "0")}`
}

export function ExamAttemptView({
  initialAttempt,
}: {
  initialAttempt: ExamAttempt
}) {
  const [attempt, setAttempt] = useState(initialAttempt)
  const [answers, setAnswers] = useState<Record<string, unknown>>(initialAttempt.answers ?? {})
  const [remaining, setRemaining] = useState(formatRemaining(initialAttempt.expiresAt))
  const [updateAttempt, { isLoading }] = useUpdateExamAttemptMutation()

  const submitted = attempt.status === AttemptStatus.SUBMITTED
  const questions = useMemo(
    () => [...attempt.exam.questions].sort((a, b) => a.order - b.order),
    [attempt.exam.questions],
  )

  const save = useCallback(
    async (submit = false) => {
      const result = await updateAttempt({
        id: attempt.id,
        body: { answers, submit },
      }).unwrap()
      setAttempt(result.data)
      setAnswers(result.data.answers)
    },
    [attempt.id, answers, updateAttempt],
  )

  useEffect(() => {
    if (!attempt.expiresAt || submitted) return
    const timer = setInterval(() => {
      const label = formatRemaining(attempt.expiresAt)
      setRemaining(label)
      if (label === "Time expired") {
        void save(true)
      }
    }, 1000)
    return () => clearInterval(timer)
  }, [attempt.expiresAt, submitted, save])

  function setAnswer(questionId: string, value: unknown) {
    setAnswers((prev) => ({ ...prev, [questionId]: value }))
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Button variant="ghost" size="sm" asChild className="mb-2">
            <Link href="/dashboard/courses">← Back</Link>
          </Button>
          <h1 className="text-2xl font-bold">{attempt.exam.title}</h1>
          {attempt.expiresAt && !submitted ? (
            <p className="mt-1 text-sm text-muted-foreground">Time remaining: {remaining}</p>
          ) : null}
          {submitted ? (
            <p className="mt-2 text-lg font-medium text-green-700">
              Score: {attempt.scorePct ?? 0}% ({attempt.scoreMarks ?? 0} / {attempt.exam.totalMarks}{" "}
              marks)
            </p>
          ) : null}
        </div>
        {!submitted ? (
          <div className="flex gap-2">
            <Button variant="outline" disabled={isLoading} onClick={() => void save(false)}>
              Save
            </Button>
            <Button disabled={isLoading} onClick={() => void save(true)}>
              Submit
            </Button>
          </div>
        ) : null}
      </div>

      <div className="space-y-6">
        {questions.map((q, index) => (
          <div key={q.id} className="rounded-xl border p-5">
            <p className="mb-3 font-medium">
              {index + 1}. {q.stem}{" "}
              <span className="text-sm font-normal text-muted-foreground">({q.marks} marks)</span>
            </p>

            {q.type === QuestionType.MCQ && q.options ? (
              <div className="space-y-2">
                {q.options.map((opt) => (
                  <label
                    key={opt.key}
                    className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-sm transition-colors ${
                      answers[q.id] === opt.key ? "border-primary bg-primary/5" : "hover:bg-muted/40"
                    }`}
                  >
                    <input
                      type="radio"
                      name={q.id}
                      value={opt.key}
                      checked={answers[q.id] === opt.key}
                      disabled={submitted}
                      onChange={() => setAnswer(q.id, opt.key)}
                      className="sr-only"
                    />
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border bg-background text-xs font-semibold">
                      {opt.key}
                    </span>
                    <span className="flex-1">{opt.text}</span>
                  </label>
                ))}
              </div>
            ) : q.type === QuestionType.TRUE_FALSE ? (
              <Select
                value={answers[q.id] != null ? String(answers[q.id]) : undefined}
                onValueChange={(v) => setAnswer(q.id, v === "true")}
                disabled={submitted}
              >
                <SelectTrigger className="max-w-xs">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">True</SelectItem>
                  <SelectItem value="false">False</SelectItem>
                </SelectContent>
              </Select>
            ) : q.type === QuestionType.WRITTEN ? (
              <Textarea
                value={String(answers[q.id] ?? "")}
                disabled={submitted}
                onChange={(e) => setAnswer(q.id, e.target.value)}
                rows={4}
              />
            ) : (
              <Input
                value={String(answers[q.id] ?? "")}
                disabled={submitted}
                onChange={(e) => setAnswer(q.id, e.target.value)}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
