"use client"

import { Plus, Trash2 } from "lucide-react"
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
import { QuestionType } from "@/types/api"
import {
  McqOptionsEditor,
  defaultMcqOptions,
  type McqOptionRow,
} from "./mcq-options-editor"

export interface InlineExamQuestion {
  key: string
  stem: string
  type: QuestionType
  marks: number
  mcqOptions: McqOptionRow[]
  correctKey: string
  correctText: string
  correctBool: string
}

let inlineKey = 0
function nextKey(): string {
  inlineKey += 1
  return `q-${inlineKey}`
}

export function newInlineExamQuestion(): InlineExamQuestion {
  return {
    key: nextKey(),
    stem: "",
    type: QuestionType.MCQ,
    marks: 1,
    mcqOptions: defaultMcqOptions.map((o) => ({ ...o })),
    correctKey: "A",
    correctText: "",
    correctBool: "true",
  }
}

export function inlineQuestionToCreateInput(q: InlineExamQuestion) {
  const options =
    q.type === QuestionType.MCQ
      ? q.mcqOptions.filter((o) => o.text.trim()).map((o) => ({ key: o.key, text: o.text.trim() }))
      : null

  const correct =
    q.type === QuestionType.TRUE_FALSE
      ? q.correctBool === "true"
      : q.type === QuestionType.MCQ
        ? q.correctKey
        : q.correctText

  return {
    stem: q.stem.trim(),
    type: q.type,
    options,
    correct,
    marks: q.marks,
  }
}

interface ExamInlineQuestionsEditorProps {
  questions: InlineExamQuestion[]
  onChange: (questions: InlineExamQuestion[]) => void
}

export function ExamInlineQuestionsEditor({
  questions,
  onChange,
}: ExamInlineQuestionsEditorProps) {
  function update(index: number, patch: Partial<InlineExamQuestion>) {
    onChange(questions.map((q, i) => (i === index ? { ...q, ...patch } : q)))
  }

  function remove(index: number) {
    if (questions.length <= 1) return
    onChange(questions.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-4">
      {questions.map((q, index) => (
        <div key={q.key} className="space-y-3 rounded-lg border bg-muted/20 p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Question {index + 1}</span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled={questions.length <= 1}
              onClick={() => remove(index)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-2">
            <Label>Question text</Label>
            <Textarea
              value={q.stem}
              onChange={(e) => update(index, { stem: e.target.value })}
              rows={2}
              required
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                value={q.type}
                onValueChange={(v) => update(index, { type: v as QuestionType })}
              >
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
              <Label>Marks</Label>
              <Input
                type="number"
                min={1}
                value={q.marks}
                onChange={(e) => update(index, { marks: Number(e.target.value) || 1 })}
              />
            </div>
          </div>
          {q.type === QuestionType.MCQ ? (
            <McqOptionsEditor
              options={q.mcqOptions}
              correctKey={q.correctKey}
              onOptionsChange={(mcqOptions) => update(index, { mcqOptions })}
              onCorrectChange={(correctKey) => update(index, { correctKey })}
            />
          ) : q.type === QuestionType.TRUE_FALSE ? (
            <div className="space-y-2">
              <Label>Correct answer</Label>
              <Select
                value={q.correctBool}
                onValueChange={(v) => update(index, { correctBool: v })}
              >
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
              <Label>Correct answer</Label>
              <Input
                value={q.correctText}
                onChange={(e) => update(index, { correctText: e.target.value })}
              />
            </div>
          )}
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={() => onChange([...questions, newInlineExamQuestion()])}>
        <Plus className="mr-1 h-4 w-4" />
        Add question
      </Button>
    </div>
  )
}
