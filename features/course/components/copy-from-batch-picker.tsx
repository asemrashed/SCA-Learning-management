"use client"

import { useMemo } from "react"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useGetBatchCurriculumQuery } from "@/features/batch/api"
import { CHAPTER } from "@/lib/product-vocabulary"
import { LessonType, type CourseSubject } from "@/types/api"
import type { LessonForm } from "./curriculum-editor"

const NONE = "__none__"

function normTitle(value: string): string {
  return value.trim().toLowerCase()
}

function findSubjectByTitle(subjects: CourseSubject[], title: string): CourseSubject | null {
  const key = normTitle(title)
  if (!key) return null
  return subjects.find((s) => normTitle(s.title) === key) ?? null
}

interface CopySubjectPickerProps {
  sourceBatchId: string
  value: string
  onChange: (subjectId: string, title: string) => void
}

export function CopySubjectPicker({ sourceBatchId, value, onChange }: CopySubjectPickerProps) {
  const { data, isFetching } = useGetBatchCurriculumQuery(sourceBatchId, {
    skip: !sourceBatchId,
  })
  const subjects = data?.data ?? []

  return (
    <div className="space-y-1">
      <Label className="text-xs">Copy subject from previous batch</Label>
      <Select
        value={value || NONE}
        onValueChange={(id) => {
          if (id === NONE) return
          const subject = subjects.find((s) => s.id === id)
          if (subject) onChange(id, subject.title)
        }}
        disabled={!sourceBatchId || isFetching}
      >
        <SelectTrigger>
          <SelectValue placeholder={isFetching ? "Loading…" : "Select subject to copy"} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={NONE}>Select subject</SelectItem>
          {subjects.map((s) => (
            <SelectItem key={s.id} value={s.id}>
              {s.title}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

interface CopyModulePickerProps {
  sourceBatchId: string
  contextSubjectTitle: string
  value: string
  onChange: (moduleId: string, title: string) => void
}

export function CopyModulePicker({
  sourceBatchId,
  contextSubjectTitle,
  value,
  onChange,
}: CopyModulePickerProps) {
  const { data, isFetching } = useGetBatchCurriculumQuery(sourceBatchId, {
    skip: !sourceBatchId,
  })
  const subjects = data?.data ?? []

  const modules = useMemo(() => {
    const matched = findSubjectByTitle(subjects, contextSubjectTitle)
    if (matched?.modules?.length) {
      return matched.modules.map((m) => ({
        id: m.id,
        label: m.title,
        title: m.title,
      }))
    }
    return subjects.flatMap((s) =>
      (s.modules ?? []).map((m) => ({
        id: m.id,
        label: `${s.title} / ${m.title}`,
        title: m.title,
      })),
    )
  }, [subjects, contextSubjectTitle])

  return (
    <div className="space-y-1">
      <Label className="text-xs">Copy {CHAPTER.toLowerCase()} from previous batch</Label>
      <Select
        value={value || NONE}
        onValueChange={(id) => {
          if (id === NONE) return
          const mod = modules.find((m) => m.id === id)
          if (mod) onChange(id, mod.title)
        }}
        disabled={!sourceBatchId || isFetching || modules.length === 0}
      >
        <SelectTrigger>
          <SelectValue
            placeholder={
              isFetching
                ? "Loading…"
                : modules.length
                  ? `Select ${CHAPTER.toLowerCase()} to copy`
                  : "No chapters in previous batch"
            }
          />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={NONE}>{`Select ${CHAPTER.toLowerCase()}`}</SelectItem>
          {modules.map((m) => (
            <SelectItem key={m.id} value={m.id}>
              {m.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

interface CopyLessonPickerProps {
  sourceBatchId: string
  contextSubjectTitle: string
  contextModuleTitle: string
  value: string
  onChange: (lesson: Pick<LessonForm, "title" | "type" | "durationS" | "isPreview" | "lectureDate">) => void
}

export function CopyLessonPicker({
  sourceBatchId,
  contextSubjectTitle,
  contextModuleTitle,
  value,
  onChange,
}: CopyLessonPickerProps) {
  const { data, isFetching } = useGetBatchCurriculumQuery(sourceBatchId, {
    skip: !sourceBatchId,
  })
  const subjects = data?.data ?? []

  const lessons = useMemo(() => {
    const subject = findSubjectByTitle(subjects, contextSubjectTitle)
    const moduleKey = normTitle(contextModuleTitle)
    const mod =
      subject?.modules?.find((m) => normTitle(m.title) === moduleKey) ??
      subject?.modules?.[0] ??
      null

    if (mod?.lessons?.length) {
      return mod.lessons.map((l) => ({ id: l.id, label: l.title, lesson: l }))
    }

    return subjects.flatMap((s) =>
      (s.modules ?? []).flatMap((m) =>
        (m.lessons ?? []).map((l) => ({
          id: l.id,
          label: `${s.title} / ${m.title} / ${l.title}`,
          lesson: l,
        })),
      ),
    )
  }, [subjects, contextSubjectTitle, contextModuleTitle])

  return (
    <div className="space-y-1">
      <Label className="text-xs">Copy lesson from previous batch</Label>
      <Select
        value={value || NONE}
        onValueChange={(id) => {
          if (id === NONE) return
          const row = lessons.find((l) => l.id === id)
          if (!row) return
          onChange({
            title: row.lesson.title,
            type: row.lesson.type ?? LessonType.RECORDED,
            durationS: row.lesson.durationS,
            isPreview: row.lesson.isPreview ?? false,
            lectureDate: row.lesson.lectureDate ?? "",
          })
        }}
        disabled={!sourceBatchId || isFetching || lessons.length === 0}
      >
        <SelectTrigger>
          <SelectValue
            placeholder={
              isFetching
                ? "Loading…"
                : lessons.length
                  ? "Select lesson to copy"
                  : "No lessons in previous batch"
            }
          />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={NONE}>Select lesson</SelectItem>
          {lessons.map((l) => (
            <SelectItem key={l.id} value={l.id}>
              {l.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
