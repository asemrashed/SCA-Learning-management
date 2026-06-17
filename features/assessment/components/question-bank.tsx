"use client"

import { useState } from "react"
import { Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
import { MediaSourceField } from "@/components/media-source-field"
import {
  CurriculumPlacementPicker,
  type CurriculumPlacement,
} from "@/components/curriculum-placement-picker"
import { getApiErrorMessage } from "@/lib/get-api-error-message"
import {
  useCreatePdfQuestionsBulkMutation,
  useCreateQuestionMutation,
  useListQuestionsQuery,
} from "@/features/assessment/api"
import { QuestionType } from "@/types/api"
import {
  McqOptionsEditor,
  defaultMcqOptions,
  type McqOptionRow,
} from "./mcq-options-editor"

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

function QuestionForm({ onSuccess }: { onSuccess?: () => void }) {
  const [createQuestion, { isLoading: creating }] = useCreateQuestionMutation()
  const [stem, setStem] = useState("")
  const [type, setType] = useState<QuestionType>(QuestionType.MCQ)
  const [category, setCategory] = useState("")
  const [marks, setMarks] = useState(1)
  const [mcqOptions, setMcqOptions] = useState<McqOptionRow[]>(defaultMcqOptions)
  const [correctKey, setCorrectKey] = useState("A")
  const [correctText, setCorrectText] = useState("")
  const [correctBool, setCorrectBool] = useState("true")
  const [error, setError] = useState<string | null>(null)

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    try {
      const options =
        type === QuestionType.MCQ
          ? mcqOptions.filter((o) => o.text.trim()).map((o) => ({ key: o.key, text: o.text.trim() }))
          : null

      const correctValue =
        type === QuestionType.TRUE_FALSE
          ? correctBool === "true"
          : type === QuestionType.MCQ
            ? correctKey
            : correctText

      await createQuestion({
        stem,
        type,
        options,
        correct: correctValue,
        category: category || null,
        marks,
      }).unwrap()

      setStem("")
      setCategory("")
      setMarks(1)
      setMcqOptions(defaultMcqOptions)
      setCorrectKey("A")
      onSuccess?.()
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to create question"))
    }
  }

  return (
    <form onSubmit={(e) => void handleCreate(e)} className="space-y-4">
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <div className="space-y-2">
        <Label htmlFor="stem">Question</Label>
        <Textarea id="stem" value={stem} onChange={(e) => setStem(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label>Type</Label>
        <Select value={type} onValueChange={(v) => setType(v as QuestionType)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.values(QuestionType)
              .filter((t) => t !== QuestionType.PDF)
              .map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="marks">Marks</Label>
        <Input
          id="marks"
          type="number"
          min={1}
          value={marks}
          onChange={(e) => setMarks(Number(e.target.value))}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <Input id="category" value={category} onChange={(e) => setCategory(e.target.value)} />
      </div>
      {type === QuestionType.MCQ ? (
        <McqOptionsEditor
          options={mcqOptions}
          correctKey={correctKey}
          onOptionsChange={setMcqOptions}
          onCorrectChange={setCorrectKey}
        />
      ) : type === QuestionType.TRUE_FALSE ? (
        <div className="space-y-2">
          <Label>Correct answer</Label>
          <Select value={correctBool} onValueChange={setCorrectBool}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">True</SelectItem>
              <SelectItem value="false">False</SelectItem>
            </SelectContent>
          </Select>
        </div>
      ) : (
        <div className="space-y-2">
          <Label htmlFor="correct">Correct answer</Label>
          <Input id="correct" value={correctText} onChange={(e) => setCorrectText(e.target.value)} />
        </div>
      )}
      <Button type="submit" disabled={creating}>
        {creating ? "Saving…" : "Add question"}
      </Button>
    </form>
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
  const [rows, setRows] = useState<PdfQuestionRow[]>([newPdfRow(), newPdfRow()])
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
      setRows([newPdfRow(), newPdfRow()])
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
  const { data, isLoading } = useListQuestionsQuery({ pageSize: 50 })
  const [mcqOpen, setMcqOpen] = useState(false)
  const [pdfOpen, setPdfOpen] = useState(false)
  const questions = data?.data ?? []

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Reusable questions for exams — MCQ/text or PDF uploads per batch.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button className="rounded-xl" variant="outline" onClick={() => setPdfOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Upload PDF questions
          </Button>
          <Button className="rounded-xl" onClick={() => setMcqOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add MCQ / text
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border bg-card">
        {isLoading ? (
          <p className="px-5 py-8 text-sm text-muted-foreground">Loading…</p>
        ) : questions.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-muted-foreground">
            No question is added yet.
          </p>
        ) : (
          <ul className="divide-y">
            {questions.map((q) => (
              <li key={q.id} className="px-5 py-4 text-sm">
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <span className="rounded bg-muted px-2 py-0.5 text-xs">{q.type}</span>
                  {q.category ? (
                    <span className="text-xs text-muted-foreground">{q.category}</span>
                  ) : null}
                  {q.batchId ? (
                    <span className="text-xs text-muted-foreground">Batch linked</span>
                  ) : null}
                  <span className="ml-auto text-xs text-muted-foreground">{q.marks} marks</span>
                </div>
                <p>{q.stem}</p>
                {q.type === QuestionType.MCQ && q.options ? (
                  <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                    {q.options.map((o) => (
                      <li key={o.key}>
                        {o.key}. {o.text}
                      </li>
                    ))}
                  </ul>
                ) : null}
                {q.type === QuestionType.PDF && q.fileUrl ? (
                  <p className="mt-1 text-xs text-muted-foreground">PDF attached</p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>

      <Dialog open={mcqOpen} onOpenChange={setMcqOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add question</DialogTitle>
            <DialogDescription>Add an MCQ or text question to the shared bank.</DialogDescription>
          </DialogHeader>
          <QuestionForm onSuccess={() => setMcqOpen(false)} />
        </DialogContent>
      </Dialog>

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
