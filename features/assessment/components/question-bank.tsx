"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
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
import { getApiErrorMessage } from "@/lib/get-api-error-message"
import {
  useCreateQuestionMutation,
  useListQuestionsQuery,
} from "@/features/assessment/api"
import { QuestionType } from "@/types/api"
import {
  McqOptionsEditor,
  defaultMcqOptions,
  type McqOptionRow,
} from "./mcq-options-editor"

function QuestionForm({
  onSuccess,
}: {
  onSuccess?: () => void
}) {
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
            {Object.values(QuestionType).map((t) => (
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

export function QuestionBankPanel() {
  const { data, isLoading } = useListQuestionsQuery({ pageSize: 50 })
  const [open, setOpen] = useState(false)
  const questions = data?.data ?? []

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">Reusable questions for exams</p>
        <Button className="rounded-xl" onClick={() => setOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add new
        </Button>
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
                <div className="mb-1 flex items-center gap-2">
                  <span className="rounded bg-muted px-2 py-0.5 text-xs">{q.type}</span>
                  {q.category ? (
                    <span className="text-xs text-muted-foreground">{q.category}</span>
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
              </li>
            ))}
          </ul>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add question</DialogTitle>
            <DialogDescription>Add a question to the shared bank for exams.</DialogDescription>
          </DialogHeader>
          <QuestionForm onSuccess={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  )
}
