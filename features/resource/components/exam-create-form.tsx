"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MediaSourceField } from "@/components/media-source-field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import {
  CurriculumPlacementPicker,
  type CurriculumPlacement,
} from "@/components/curriculum-placement-picker"
import { useGetBatchQuery } from "@/features/batch/api"
import { useGetCourseQuery } from "@/features/course/api"
import {
  useCreateResourceMutation,
  useLazyListResourcesQuery,
} from "@/features/resource/api"
import {
  QuestionBankFilters,
  type QuestionBankFilterValues,
} from "@/features/resource/components/question-bank-filters"
import { getApiErrorMessage } from "@/lib/get-api-error-message"
import { BATCH } from "@/lib/product-vocabulary"
import { isBatchScopedCategory, isSubjectRequiredCategory } from "@/lib/resource-categories"
import type { ResourceItem } from "@/types/api"
import { DeliveryMode, ResourceCategory } from "@/types/api"

const initialPlacement: CurriculumPlacement = {
  batchId: null,
  subjectId: null,
  moduleId: null,
  lessonId: null,
}

type ExamSource = "upload" | "question_bank"

const emptyQbFilters: QuestionBankFilterValues = {
  courseId: "",
  batchId: "",
  subjectId: "",
}

function toDateTimeInputValue(iso: string | null | undefined): string {
  if (!iso) return ""
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ""
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

interface ExamCreateFormProps {
  fixedBatchId?: string
  fixedCourseId?: string
  resource?: ResourceItem
  onSuccess?: () => void
  inModal?: boolean
}

export function ExamCreateForm({
  fixedBatchId,
  fixedCourseId,
  resource,
  onSuccess,
  inModal = false,
}: ExamCreateFormProps) {
  const isEdit = Boolean(resource)
  const { data: fixedBatch } = useGetBatchQuery(fixedBatchId ?? "", { skip: !fixedBatchId })

  const [source, setSource] = useState<ExamSource>(
    resource?.linkedQuestionIds?.length ? "question_bank" : "upload",
  )
  const [title, setTitle] = useState(resource?.title ?? "")
  const [fileUrl, setFileUrl] = useState(resource?.fileUrl ?? "")
  const [startsAt, setStartsAt] = useState(toDateTimeInputValue(resource?.startsAt))
  const [deadlineAt, setDeadlineAt] = useState(toDateTimeInputValue(resource?.deadlineAt))
  const [qbFilters, setQbFilters] = useState<QuestionBankFilterValues>(emptyQbFilters)
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>(
    resource?.linkedQuestionIds ?? [],
  )
  const [qbQuestions, setQbQuestions] = useState<ResourceItem[]>([])
  const [qbLoading, setQbLoading] = useState(false)
  const [qbLoadError, setQbLoadError] = useState<string | null>(null)
  const [placement, setPlacement] = useState<CurriculumPlacement>({
    ...initialPlacement,
    courseId: fixedCourseId ?? resource?.courseId ?? undefined,
    batchId: fixedBatchId ?? resource?.batchId ?? null,
    subjectId: resource?.subjectId ?? null,
  })
  const [error, setError] = useState<string | null>(null)

  const [createResource, { isLoading: creating }] = useCreateResourceMutation()
  const [fetchResources] = useLazyListResourcesQuery()

  const courseIdForQuery =
    placement.courseId?.trim() ||
    fixedCourseId ||
    fixedBatch?.data?.courseId ||
    resource?.courseId ||
    qbFilters.courseId ||
    ""
  const { data: courseData } = useGetCourseQuery(courseIdForQuery, { skip: !courseIdForQuery })
  const isLive = courseData?.data?.deliveryMode === DeliveryMode.LIVE
  const requireBatch = isLive && isBatchScopedCategory(ResourceCategory.EXAM)
  const subjectRequired = isLive && isSubjectRequiredCategory(ResourceCategory.EXAM)

  const qbFilterKey = useMemo(
    () => [source, qbFilters.courseId, qbFilters.batchId, qbFilters.subjectId].join(":"),
    [source, qbFilters],
  )

  useEffect(() => {
    if (qbFilters.courseId && !placement.courseId) {
      setPlacement((prev) => ({ ...prev, courseId: qbFilters.courseId }))
    }
  }, [qbFilters.courseId, placement.courseId])

  useEffect(() => {
    if (source !== "question_bank" || !qbFilters.courseId) {
      setQbQuestions([])
      setQbLoadError(null)
      return
    }

    let cancelled = false
    setQbLoading(true)
    setQbLoadError(null)

    async function loadQuestions() {
      const result = await fetchResources({
        courseId: qbFilters.courseId,
        pageSize: 100,
        category: ResourceCategory.QUESTION_BANK,
        ...(qbFilters.batchId ? { batchId: qbFilters.batchId } : {}),
        ...(qbFilters.subjectId ? { subjectId: qbFilters.subjectId } : {}),
      })

      if (!cancelled) {
        if (result.error) {
          setQbLoadError(getApiErrorMessage(result.error, "Could not load questions."))
          setQbQuestions([])
        } else {
          setQbQuestions(result.data?.data ?? [])
        }
        setQbLoading(false)
      }
    }

    void loadQuestions()
    return () => {
      cancelled = true
    }
  }, [qbFilterKey, source, fetchResources])

  function toggleQuestion(id: string) {
    setSelectedQuestionIds((prev) =>
      prev.includes(id) ? prev.filter((q) => q !== id) : [...prev, id],
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (isEdit) {
      setError("Editing exams is not supported here yet. Delete and recreate if needed.")
      return
    }

    const courseId =
      placement.courseId?.trim() ||
      fixedCourseId ||
      fixedBatch?.data?.courseId ||
      qbFilters.courseId

    if (!courseId) {
      setError("Please select a course.")
      return
    }

    if (requireBatch && !placement.batchId) {
      setError(`Please select a ${BATCH.toLowerCase()}.`)
      return
    }

    if (subjectRequired && !placement.subjectId) {
      setError("Please select a subject.")
      return
    }

    if (!startsAt.trim()) {
      setError("Please set a start time.")
      return
    }

    if (!deadlineAt.trim()) {
      setError("Please set a deadline.")
      return
    }

    if (new Date(startsAt) > new Date(deadlineAt)) {
      setError("Start time must be before the deadline.")
      return
    }

    if (source === "upload" && !fileUrl.trim()) {
      setError("Upload an exam PDF or paste a file link.")
      return
    }

    if (source === "question_bank" && selectedQuestionIds.length === 0) {
      setError("Select at least one question from the bank.")
      return
    }

    try {
      await createResource({
        title,
        category: ResourceCategory.EXAM,
        courseId,
        batchId: placement.batchId ?? null,
        subjectId: placement.subjectId ?? null,
        moduleId: null,
        lessonId: null,
        fileType: "pdf",
        fileUrl: source === "upload" ? fileUrl : undefined,
        linkedQuestionIds: source === "question_bank" ? selectedQuestionIds : null,
        startsAt: new Date(startsAt).toISOString(),
        deadlineAt: new Date(deadlineAt).toISOString(),
      }).unwrap()

      setTitle("")
      setFileUrl("")
      setStartsAt("")
      setDeadlineAt("")
      setSelectedQuestionIds([])
      setPlacement({
        ...initialPlacement,
        courseId: fixedCourseId ?? courseId,
        batchId: fixedBatchId ?? null,
      })
      onSuccess?.()
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not create exam. Check fields and try again."))
    }
  }

  return (
    <form
      onSubmit={(e) => void handleSubmit(e)}
      className={inModal ? "space-y-6" : "space-y-6 rounded-xl border bg-card p-6"}
    >
      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="exam-title">Title</Label>
          <Input
            id="exam-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        {!isEdit ? (
          <div className="space-y-2">
            <Label>Exam source</Label>
            <Select value={source} onValueChange={(v) => setSource(v as ExamSource)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="upload">Upload exam PDF</SelectItem>
                <SelectItem value="question_bank">Question bank</SelectItem>
              </SelectContent>
            </Select>
          </div>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="exam-starts-at">Start time</Label>
            <Input
              id="exam-starts-at"
              type="datetime-local"
              value={startsAt}
              onChange={(e) => setStartsAt(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="exam-deadline">Deadline</Label>
            <Input
              id="exam-deadline"
              type="datetime-local"
              value={deadlineAt}
              onChange={(e) => setDeadlineAt(e.target.value)}
              required
            />
          </div>
        </div>

        {source === "upload" ? (
          <MediaSourceField
            label="Exam PDF"
            value={fileUrl}
            onChange={setFileUrl}
            folder="documents"
            accept=".pdf,application/pdf"
            placeholder="Upload or paste URL"
          />
        ) : (
          <div className="space-y-4 rounded-xl border bg-muted/20 p-4">
            <p className="text-sm font-medium">Filter questions</p>
            <QuestionBankFilters values={qbFilters} onChange={setQbFilters} layout="column" />

            {!qbFilters.courseId ? (
              <p className="text-sm text-muted-foreground">
                Select a course to load questions from the bank.
              </p>
            ) : qbLoading ? (
              <p className="text-sm text-muted-foreground">Loading questions…</p>
            ) : qbLoadError ? (
              <p className="text-sm text-destructive">{qbLoadError}</p>
            ) : qbQuestions.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No questions in the bank for this course yet. Add questions on the Question bank page.
              </p>
            ) : (
              <ul className="max-h-64 space-y-2 overflow-y-auto rounded-xl border bg-card p-3">
                {qbQuestions.map((question) => {
                  const checked = selectedQuestionIds.includes(question.id)
                  return (
                    <li
                      key={question.id}
                      className="flex items-start gap-3 rounded-lg px-2 py-1.5 hover:bg-muted/40"
                    >
                      <Checkbox
                        id={`qb-${question.id}`}
                        checked={checked}
                        onCheckedChange={() => toggleQuestion(question.id)}
                      />
                      <label
                        htmlFor={`qb-${question.id}`}
                        className="min-w-0 flex-1 cursor-pointer text-sm"
                      >
                        <span className="font-medium">{question.title}</span>
                        {question.marks != null ? (
                          <span className="ml-2 text-muted-foreground">
                            ({question.marks} marks)
                          </span>
                        ) : null}
                      </label>
                    </li>
                  )
                })}
              </ul>
            )}

            {selectedQuestionIds.length > 0 ? (
              <p className="text-sm text-muted-foreground">
                {selectedQuestionIds.length} question
                {selectedQuestionIds.length === 1 ? "" : "s"} selected
              </p>
            ) : null}
          </div>
        )}

        <CurriculumPlacementPicker
          value={placement}
          onChange={setPlacement}
          fixedBatchId={fixedBatchId}
          fixedCourseId={fixedCourseId ?? resource?.courseId ?? undefined}
          requireBatch={requireBatch}
          subjectRequired={subjectRequired}
        />
      </div>

      <Button type="submit" disabled={creating || isEdit}>
        {creating ? "Saving…" : isEdit ? "Update exam" : "Create exam"}
      </Button>
    </form>
  )
}
