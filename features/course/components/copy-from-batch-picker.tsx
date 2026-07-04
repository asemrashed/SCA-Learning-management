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
import { useGetCourseQuery } from "@/features/course/api"
import { CHAPTER } from "@/lib/product-vocabulary"
import { LessonType, type CourseModule, type CourseSubject } from "@/types/api"
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

function findSubjectById(subjects: CourseSubject[], subjectId: string): CourseSubject | null {
  if (!subjectId) return null
  return subjects.find((s) => s.id === subjectId) ?? null
}

/** Source for copying curriculum titles (live batch and/or recorded course). */
export interface CurriculumCopySource {
  /** Live batch curriculum */
  batchId?: string
  /** When set with batchId, only that subject's chapters/lessons are offered */
  subjectId?: string
  /** Recorded course modules (used when batchId is empty) */
  courseId?: string
}

function useSourceModules(
  source: CurriculumCopySource,
  contextSubjectTitle?: string,
): {
  modules: { id: string; label: string; title: string }[]
  isFetching: boolean
} {
  const batchId = source.batchId ?? ""
  const courseId = source.courseId ?? ""
  const { data: batchData, isFetching: batchFetching } = useGetBatchCurriculumQuery(batchId, {
    skip: !batchId,
  })
  const { data: courseData, isFetching: courseFetching } = useGetCourseQuery(courseId, {
    skip: !courseId || Boolean(batchId),
  })

  const modules = useMemo(() => {
    if (batchId) {
      const subjects = batchData?.data ?? []
      const matched =
        (source.subjectId ? findSubjectById(subjects, source.subjectId) : null) ??
        (contextSubjectTitle ? findSubjectByTitle(subjects, contextSubjectTitle) : null)
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
    }

    const courseModules = courseData?.data?.modules ?? []
    return courseModules.map((m) => ({
      id: m.id,
      label: m.title,
      title: m.title,
    }))
  }, [batchId, batchData?.data, courseData?.data?.modules, source.subjectId, contextSubjectTitle])

  return {
    modules,
    isFetching: batchId ? batchFetching : courseFetching,
  }
}

function useSourceLessons(
  source: CurriculumCopySource,
  contextModuleTitle: string,
  contextSubjectTitle?: string,
): {
  lessons: { id: string; label: string; lesson: CourseModule["lessons"][number] }[]
  isFetching: boolean
} {
  const batchId = source.batchId ?? ""
  const courseId = source.courseId ?? ""
  const { data: batchData, isFetching: batchFetching } = useGetBatchCurriculumQuery(batchId, {
    skip: !batchId,
  })
  const { data: courseData, isFetching: courseFetching } = useGetCourseQuery(courseId, {
    skip: !courseId || Boolean(batchId),
  })

  const lessons = useMemo(() => {
    const moduleKey = normTitle(contextModuleTitle)

    if (batchId) {
      const subjects = batchData?.data ?? []
      const subject =
        (source.subjectId ? findSubjectById(subjects, source.subjectId) : null) ??
        (contextSubjectTitle ? findSubjectByTitle(subjects, contextSubjectTitle) : null)
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
    }

    const courseModules = courseData?.data?.modules ?? []
    const mod =
      courseModules.find((m) => normTitle(m.title) === moduleKey) ?? courseModules[0] ?? null
    if (mod?.lessons?.length) {
      return mod.lessons.map((l) => ({ id: l.id, label: l.title, lesson: l }))
    }
    return courseModules.flatMap((m) =>
      (m.lessons ?? []).map((l) => ({
        id: l.id,
        label: `${m.title} / ${l.title}`,
        lesson: l,
      })),
    )
  }, [
    batchId,
    batchData?.data,
    courseData?.data?.modules,
    contextModuleTitle,
    contextSubjectTitle,
    source.subjectId,
  ])

  return {
    lessons,
    isFetching: batchId ? batchFetching : courseFetching,
  }
}

function sourceReady(source: CurriculumCopySource): boolean {
  return Boolean(source.batchId || source.courseId)
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
  source?: CurriculumCopySource
  /** Prefer `source.batchId` when using the structured source */
  sourceBatchId?: string
  contextSubjectTitle?: string
  value: string
  onChange: (moduleId: string, title: string) => void
  label?: string
}

export function CopyModulePicker({
  source: sourceProp,
  sourceBatchId,
  contextSubjectTitle,
  value,
  onChange,
  label,
}: CopyModulePickerProps) {
  const source: CurriculumCopySource =
    sourceProp?.batchId || sourceProp?.courseId
      ? sourceProp
      : { batchId: sourceBatchId }

  const { modules, isFetching } = useSourceModules(source, contextSubjectTitle)
  const ready = sourceReady(source)

  return (
    <div className="space-y-1">
      <Label className="text-xs">
        {label ?? `Copy ${CHAPTER.toLowerCase()} from previous curriculum`}
      </Label>
      <Select
        value={value || NONE}
        onValueChange={(id) => {
          if (id === NONE) return
          const mod = modules.find((m) => m.id === id)
          if (mod) onChange(id, mod.title)
        }}
        disabled={!ready || isFetching || modules.length === 0}
      >
        <SelectTrigger>
          <SelectValue
            placeholder={
              isFetching
                ? "Loading…"
                : modules.length
                  ? `Select ${CHAPTER.toLowerCase()} to copy`
                  : "No chapters in previous curriculum"
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
  source?: CurriculumCopySource
  /** Prefer `source.batchId` when using the structured source */
  sourceBatchId?: string
  contextSubjectTitle?: string
  contextModuleTitle: string
  value: string
  onChange: (
    lesson: Pick<
      LessonForm,
      "title" | "type" | "durationS" | "isPreview" | "lectureDate" | "videoUrl" | "content"
    >,
  ) => void
  label?: string
}

export function CopyLessonPicker({
  source: sourceProp,
  sourceBatchId,
  contextSubjectTitle,
  contextModuleTitle,
  value,
  onChange,
  label,
}: CopyLessonPickerProps) {
  const source: CurriculumCopySource =
    sourceProp?.batchId || sourceProp?.courseId
      ? sourceProp
      : { batchId: sourceBatchId }

  const { lessons, isFetching } = useSourceLessons(source, contextModuleTitle, contextSubjectTitle)
  const ready = sourceReady(source)

  return (
    <div className="space-y-1">
      <Label className="text-xs">{label ?? "Copy lesson from previous curriculum"}</Label>
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
            videoUrl: row.lesson.videoUrl ?? row.lesson.joinUrl ?? "",
            content: row.lesson.content ?? "",
          })
        }}
        disabled={!ready || isFetching || lessons.length === 0}
      >
        <SelectTrigger>
          <SelectValue
            placeholder={
              isFetching
                ? "Loading…"
                : lessons.length
                  ? "Select lesson to copy"
                  : "No lessons in previous curriculum"
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
