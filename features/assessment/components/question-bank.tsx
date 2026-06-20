"use client"

import { useEffect, useMemo, useState } from "react"
import { Eye, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { MediaSourceField } from "@/components/media-source-field"
import {
  CurriculumPlacementPicker,
  type CurriculumPlacement,
} from "@/components/curriculum-placement-picker"
import { useListBatchesByCourseQuery, useGetBatchCurriculumQuery } from "@/features/batch/api"
import { useListCoursesQuery } from "@/features/course/api"
import { getApiErrorMessage } from "@/lib/get-api-error-message"
import { BATCH, COURSE } from "@/lib/product-vocabulary"
import {
  useCreatePdfQuestionsBulkMutation,
  useListQuestionsQuery,
} from "@/features/assessment/api"
import { QuestionType } from "@/types/api"

const PAGE_SIZE = 20
const ALL = "__all__"

interface PdfQuestionRow {
  key: string
  title: string
  fileUrl: string
  marks: number
}

let pdfRowKey = 0
function newPdfRow(): PdfQuestionRow {
  pdfRowKey += 1
  return { key: `pdf-${pdfRowKey}`, title: "", fileUrl: "", marks: 1 }
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

function QuestionPdfViewButton({ title, fileUrl }: { title: string; fileUrl: string }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button type="button" variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Eye className="mr-1 h-4 w-4" />
        PDF
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[95vh] max-w-5xl gap-0 overflow-hidden p-0">
          <DialogHeader className="border-b px-4 py-3">
            <DialogTitle className="text-base">{title}</DialogTitle>
          </DialogHeader>
          <iframe
            src={fileUrl}
            title={title}
            className="min-h-[80vh] w-full border-0"
          />
        </DialogContent>
      </Dialog>
    </>
  )
}

function QuestionBankFilters({
  courseId,
  batchId,
  subjectId,
  onCourseChange,
  onBatchChange,
  onSubjectChange,
}: {
  courseId: string
  batchId: string
  subjectId: string
  onCourseChange: (id: string) => void
  onBatchChange: (id: string) => void
  onSubjectChange: (id: string) => void
}) {
  const { data: coursesData } = useListCoursesQuery({ pageSize: 100 })
  const { data: batchesData } = useListBatchesByCourseQuery(courseId, { skip: !courseId })
  const { data: curriculumData } = useGetBatchCurriculumQuery(batchId, { skip: !batchId })

  const courses = coursesData?.data ?? []
  const batches = batchesData?.data ?? []
  const subjects = curriculumData?.data ?? []

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <div className="space-y-2">
        <Label>{COURSE}</Label>
        <Select
          value={courseId || ALL}
          onValueChange={(v) => {
            onCourseChange(v === ALL ? "" : v)
            onBatchChange("")
            onSubjectChange("")
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder={`All ${COURSE.toLowerCase()}s`} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All {COURSE.toLowerCase()}s</SelectItem>
            {courses.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>{BATCH}</Label>
        <Select
          value={batchId || ALL}
          onValueChange={(v) => {
            onBatchChange(v === ALL ? "" : v)
            onSubjectChange("")
          }}
          disabled={!courseId}
        >
          <SelectTrigger>
            <SelectValue placeholder={courseId ? `All ${BATCH.toLowerCase()}es` : `Select ${COURSE.toLowerCase()} first`} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All {BATCH.toLowerCase()}es</SelectItem>
            {batches.map((b) => (
              <SelectItem key={b.id} value={b.id}>
                {b.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Subject</Label>
        <Select
          value={subjectId || ALL}
          onValueChange={(v) => onSubjectChange(v === ALL ? "" : v)}
          disabled={!batchId}
        >
          <SelectTrigger>
            <SelectValue placeholder={batchId ? "All subjects" : `Select ${BATCH.toLowerCase()} first`} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All subjects</SelectItem>
            {subjects.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

function PdfQuestionsBulkForm({ onSuccess }: { onSuccess?: () => void }) {
  const [createBulk, { isLoading }] = useCreatePdfQuestionsBulkMutation()
  const [placement, setPlacement] = useState<CurriculumPlacement>({
    batchId: null,
    subjectId: null,
    moduleId: null,
    lessonId: null,
  })
  const [rows, setRows] = useState<PdfQuestionRow[]>([newPdfRow()])
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!placement.courseId || !placement.batchId) {
      setError("Please select a course and batch.")
      return
    }
    if (!placement.subjectId) {
      setError("Please select a subject.")
      return
    }

    const questions = rows
      .filter((row) => row.title.trim() && row.fileUrl.trim())
      .map((row) => ({
        title: row.title.trim(),
        fileUrl: row.fileUrl.trim(),
        marks: row.marks,
      }))

    if (questions.length === 0) {
      setError("Add at least one question PDF with a title.")
      return
    }

    try {
      await createBulk({
        batchId: placement.batchId,
        subjectId: placement.subjectId,
        moduleId: placement.moduleId ?? null,
        questions,
      }).unwrap()
      setRows([newPdfRow()])
      onSuccess?.()
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to upload question PDFs"))
    }
  }

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <CurriculumPlacementPicker
        value={placement}
        onChange={setPlacement}
        requireBatch
        subjectRequired
      />

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Question PDFs</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setRows((prev) => [...prev, newPdfRow()])}
          >
            <Plus className="mr-1 h-4 w-4" />
            Add another
          </Button>
        </div>

        {rows.map((row, index) => (
          <div key={row.key} className="space-y-3 rounded-lg border border-dashed p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Question {index + 1}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={rows.length === 1}
                onClick={() => setRows((prev) => prev.filter((r) => r.key !== row.key))}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <Input
              placeholder="Question title"
              value={row.title}
              onChange={(e) =>
                setRows((prev) =>
                  prev.map((r) => (r.key === row.key ? { ...r, title: e.target.value } : r)),
                )
              }
            />
            <MediaSourceField
              label="Question PDF"
              value={row.fileUrl}
              onChange={(url) =>
                setRows((prev) =>
                  prev.map((r) => (r.key === row.key ? { ...r, fileUrl: url } : r)),
                )
              }
              folder="documents"
              accept=".pdf,application/pdf"
              placeholder="Upload PDF"
            />
            <Input
              type="number"
              min={1}
              placeholder="Marks"
              value={row.marks}
              onChange={(e) =>
                setRows((prev) =>
                  prev.map((r) =>
                    r.key === row.key ? { ...r, marks: Number(e.target.value) || 1 } : r,
                  ),
                )
              }
            />
          </div>
        ))}
      </div>

      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Saving…" : `Save ${rows.filter((r) => r.title && r.fileUrl).length || ""} question PDFs`}
      </Button>
    </form>
  )
}

export function QuestionBankPanel() {
  const [page, setPage] = useState(1)
  const [courseId, setCourseId] = useState("")
  const [batchId, setBatchId] = useState("")
  const [subjectId, setSubjectId] = useState("")
  const [pdfOpen, setPdfOpen] = useState(false)

  const queryParams = useMemo(
    () => ({
      page,
      pageSize: PAGE_SIZE,
      ...(courseId ? { courseId } : {}),
      ...(batchId ? { batchId } : {}),
      ...(subjectId ? { subjectId } : {}),
      sort: "createdAt:desc",
    }),
    [page, courseId, batchId, subjectId],
  )

  const { data, isLoading, isFetching } = useListQuestionsQuery(queryParams)
  const questions = data?.data ?? []
  const meta = data?.meta
  const totalPages = meta ? Math.max(1, Math.ceil(meta.total / PAGE_SIZE)) : 1

  useEffect(() => {
    setPage(1)
  }, [courseId, batchId, subjectId])

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Upload question PDFs per batch — they appear in the list automatically.
        </p>
        <Button className="rounded-xl" onClick={() => setPdfOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Upload PDF questions
        </Button>
      </div>

      <div className="rounded-xl border bg-card p-4">
        <QuestionBankFilters
          courseId={courseId}
          batchId={batchId}
          subjectId={subjectId}
          onCourseChange={setCourseId}
          onBatchChange={setBatchId}
          onSubjectChange={setSubjectId}
        />
      </div>

      <div className="overflow-hidden rounded-xl border bg-card">
        {isLoading ? (
          <p className="px-5 py-8 text-sm text-muted-foreground">Loading…</p>
        ) : questions.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-muted-foreground">
            No questions found.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b bg-muted/40 text-left text-xs text-muted-foreground">
                  <th className="px-4 py-3 font-medium">#</th>
                  <th className="px-4 py-3 font-medium">Title</th>
                  <th className="px-4 py-3 font-medium">Subject</th>
                  <th className="px-4 py-3 font-medium">{COURSE}</th>
                  <th className="px-4 py-3 font-medium">{BATCH}</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">PDF</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {questions.map((q, index) => {
                  const rowNumber = (page - 1) * PAGE_SIZE + index + 1
                  return (
                    <tr key={q.id} className="hover:bg-muted/20">
                      <td className="px-4 py-3 text-muted-foreground">{rowNumber}</td>
                      <td className="max-w-[220px] px-4 py-3">
                        <p className="truncate font-medium" title={q.stem}>
                          {q.stem}
                        </p>
                        <p className="text-xs text-muted-foreground">{q.marks} marks</p>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {q.subjectTitle ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {q.courseTitle ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {q.batchTitle ?? "—"}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                        {formatDate(q.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        {q.type === QuestionType.PDF && q.fileUrl ? (
                          <QuestionPdfViewButton title={q.stem} fileUrl={q.fileUrl} />
                        ) : q.type !== QuestionType.PDF ? (
                          <span className="text-xs text-muted-foreground">{q.type}</span>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {meta && meta.total > PAGE_SIZE ? (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t px-4 py-3">
            <p className="text-xs text-muted-foreground">
              Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, meta.total)} of{" "}
              {meta.total}
              {isFetching ? " · Updating…" : ""}
            </p>
            <Pagination className="mx-0 w-auto justify-end">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      if (page > 1) setPage((p) => p - 1)
                    }}
                    className={page <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
                <PaginationItem>
                  <span className="px-2 text-sm text-muted-foreground">
                    Page {page} of {totalPages}
                  </span>
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      if (page < totalPages) setPage((p) => p + 1)
                    }}
                    className={
                      page >= totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        ) : null}
      </div>

      <Dialog open={pdfOpen} onOpenChange={setPdfOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Upload question PDFs</DialogTitle>
            <DialogDescription>
              Select course, batch, and subject, then upload one or more question PDFs at once.
            </DialogDescription>
          </DialogHeader>
          <PdfQuestionsBulkForm onSuccess={() => setPdfOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  )
}
