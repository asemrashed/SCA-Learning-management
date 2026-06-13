"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  CurriculumPlacementPicker,
  type CurriculumPlacement,
} from "@/components/curriculum-placement-picker"
import { getApiErrorMessage } from "@/lib/get-api-error-message"
import { resolvePlacementIds } from "@/lib/placement-ids"
import {
  useCreateExamMutation,
  useCreateAssignmentMutation,
  useCreateQuestionMutation,
  useListQuestionsQuery,
} from "@/features/assessment/api"
import { QuestionType } from "@/types/api"
import {
  ExamInlineQuestionsEditor,
  inlineQuestionToCreateInput,
  newInlineExamQuestion,
  type InlineExamQuestion,
} from "./exam-inline-questions"

const initialPlacement: CurriculumPlacement = {
  scope: "batch",
  subjectId: null,
  moduleId: null,
  lessonId: null,
}

interface FormProps {
  fixedBatchId?: string
  fixedCourseId?: string
  onSuccess?: () => void
  inModal?: boolean
}

export function ExamCreateForm({
  fixedBatchId,
  fixedCourseId,
  onSuccess,
  inModal = false,
}: FormProps = {}) {
  const { data: questionsData } = useListQuestionsQuery({ pageSize: 100 })
  const [createQuestion] = useCreateQuestionMutation()
  const [createExam, { isLoading }] = useCreateExamMutation()
  const [title, setTitle] = useState("")
  const [durationMin, setDurationMin] = useState<number | "">(30)
  const [publish, setPublish] = useState(true)
  const [questionMode, setQuestionMode] = useState<"create" | "bank">("create")
  const [inlineQuestions, setInlineQuestions] = useState<InlineExamQuestion[]>([
    newInlineExamQuestion(),
  ])
  const [selectedBank, setSelectedBank] = useState<string[]>([])
  const [placement, setPlacement] = useState<CurriculumPlacement>({
    ...initialPlacement,
    scope: fixedCourseId ? "course" : "batch",
    batchId: fixedBatchId,
    courseId: fixedCourseId,
  })
  const [message, setMessage] = useState<string | null>(null)
  const [isError, setIsError] = useState(false)

  const bankQuestions = questionsData?.data ?? []

  function toggleBank(id: string) {
    setSelectedBank((prev) =>
      prev.includes(id) ? prev.filter((q) => q !== id) : [...prev, id],
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setMessage(null)
    setIsError(false)

    const { batchId, courseId, error: placementError } = resolvePlacementIds(placement)
    if (placementError) {
      setMessage(placementError)
      setIsError(true)
      return
    }

    if (courseId && !placement.moduleId) {
      setMessage("Course exams require a module (pick module or lesson).")
      setIsError(true)
      return
    }

    let questionIds: string[] = []

    try {
      if (questionMode === "create") {
        const valid = inlineQuestions.filter((q) => q.stem.trim())
        if (valid.length === 0) {
          setMessage("Add at least one question with text.")
          setIsError(true)
          return
        }
        for (const q of valid) {
          const payload = inlineQuestionToCreateInput(q)
          if (q.type === QuestionType.MCQ && (!payload.options || payload.options.length < 2)) {
            setMessage("Each MCQ needs at least two answer options.")
            setIsError(true)
            return
          }
          const created = await createQuestion(payload).unwrap()
          questionIds.push(created.data.id)
        }
      } else {
        if (selectedBank.length === 0) {
          setMessage("Select at least one question from the bank, or switch to Create new questions.")
          setIsError(true)
          return
        }
        questionIds = selectedBank
      }

      await createExam({
        batchId,
        courseId,
        moduleId: placement.moduleId ?? undefined,
        title,
        durationMin: durationMin === "" ? null : Number(durationMin),
        questionIds,
        status: publish ? "PUBLISHED" : "DRAFT",
      }).unwrap()

      setTitle("")
      setInlineQuestions([newInlineExamQuestion()])
      setSelectedBank([])
      setMessage("Exam created successfully.")
      setIsError(false)
      onSuccess?.()
    } catch (err) {
      setMessage(getApiErrorMessage(err, "Failed to create exam."))
      setIsError(true)
    }
  }

  return (
    <form
      onSubmit={(e) => void handleSubmit(e)}
      className={inModal ? "space-y-6" : "space-y-6 rounded-xl border bg-card p-6"}
    >
      {!inModal ? (
        <div>
          <h3 className="text-lg font-semibold">Create exam</h3>
          <p className="text-sm text-muted-foreground">
            Add questions directly or pick from the bank, then attach to batch or course.
          </p>
        </div>
      ) : null}
      {message ? (
        <p className={`text-sm ${isError ? "text-destructive" : "text-green-700"}`}>{message}</p>
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="exam-title">Title</Label>
          <Input id="exam-title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>
        <div className="space-y-2 sm:col-span-1">
          <Label htmlFor="duration">Duration (minutes)</Label>
          <Input
            id="duration"
            type="number"
            min={1}
            value={durationMin}
            onChange={(e) => setDurationMin(e.target.value === "" ? "" : Number(e.target.value))}
          />
        </div>
        <div className="flex items-end pb-2 sm:col-span-1">
          <label className="flex items-center gap-2 text-sm">
            <Checkbox checked={publish} onCheckedChange={(v) => setPublish(Boolean(v))} />
            Publish immediately
          </label>
        </div>
        <CurriculumPlacementPicker
          className="contents"
          value={placement}
          onChange={setPlacement}
          fixedBatchId={fixedBatchId}
          fixedCourseId={fixedCourseId}
          showScopeToggle={!fixedBatchId && !fixedCourseId}
          moduleLabel={placement.scope === "course" ? "Module (required)" : "Module (optional)"}
        />
      </div>

      <div className="space-y-3 sm:col-span-2">
        <Label>Questions</Label>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant={questionMode === "create" ? "default" : "outline"}
            onClick={() => setQuestionMode("create")}
          >
            Create new questions
          </Button>
          <Button
            type="button"
            size="sm"
            variant={questionMode === "bank" ? "default" : "outline"}
            onClick={() => setQuestionMode("bank")}
          >
            From question bank
          </Button>
        </div>

        {questionMode === "create" ? (
          <ExamInlineQuestionsEditor questions={inlineQuestions} onChange={setInlineQuestions} />
        ) : (
          <div className="max-h-56 space-y-2 overflow-y-auto rounded border p-3">
            {bankQuestions.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Bank is empty — use Create new questions instead.
              </p>
            ) : (
              bankQuestions.map((q) => (
                <label key={q.id} className="flex items-start gap-2 text-sm">
                  <Checkbox
                    checked={selectedBank.includes(q.id)}
                    onCheckedChange={() => toggleBank(q.id)}
                  />
                  <span>{q.stem.slice(0, 160)}</span>
                </label>
              ))
            )}
          </div>
        )}
      </div>

      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Creating…" : "Create exam"}
      </Button>
    </form>
  )
}

export function AssignmentCreateForm({
  fixedBatchId,
  fixedCourseId,
  onSuccess,
  inModal = false,
}: FormProps = {}) {
  const [createAssignment, { isLoading }] = useCreateAssignmentMutation()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [totalMarks, setTotalMarks] = useState(100)
  const [placement, setPlacement] = useState<CurriculumPlacement>({
    ...initialPlacement,
    scope: fixedCourseId ? "course" : "batch",
    batchId: fixedBatchId,
    courseId: fixedCourseId,
  })
  const [message, setMessage] = useState<string | null>(null)
  const [isError, setIsError] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setMessage(null)
    setIsError(false)

    const { batchId, courseId, error: placementError } = resolvePlacementIds(placement)
    if (placementError) {
      setMessage(placementError)
      setIsError(true)
      return
    }

    try {
      await createAssignment({
        batchId,
        courseId,
        moduleId: placement.moduleId ?? undefined,
        title: title.trim(),
        description: description.trim() || null,
        totalMarks: Number(totalMarks) || 100,
      }).unwrap()
      setTitle("")
      setDescription("")
      setMessage("Assignment created successfully.")
      setIsError(false)
      onSuccess?.()
    } catch (err) {
      setMessage(getApiErrorMessage(err, "Failed to create assignment."))
      setIsError(true)
    }
  }

  return (
    <form
      onSubmit={(e) => void handleSubmit(e)}
      className={inModal ? "space-y-6" : "space-y-6 rounded-xl border bg-card p-6"}
    >
      {!inModal ? (
        <div>
          <h3 className="text-lg font-semibold">Create assignment</h3>
          <p className="text-sm text-muted-foreground">
            Attach to a batch or course; module and lesson are optional.
          </p>
        </div>
      ) : null}
      {message ? (
        <p className={`text-sm ${isError ? "text-destructive" : "text-green-700"}`}>{message}</p>
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="assign-title">Title</Label>
          <Input
            id="assign-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="assign-desc">Description</Label>
          <Textarea
            id="assign-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
          />
        </div>
        <CurriculumPlacementPicker
          className="contents"
          value={placement}
          onChange={setPlacement}
          fixedBatchId={fixedBatchId}
          fixedCourseId={fixedCourseId}
          showScopeToggle={!fixedBatchId && !fixedCourseId}
          beforeLesson={
            <div className="space-y-2">
              <Label htmlFor="assign-marks">Total marks</Label>
              <Input
                id="assign-marks"
                type="number"
                min={1}
                value={totalMarks}
                onChange={(e) => setTotalMarks(Number(e.target.value))}
              />
            </div>
          }
        />
      </div>

      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Creating…" : "Create assignment"}
      </Button>
    </form>
  )
}
