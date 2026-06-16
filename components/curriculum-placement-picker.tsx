"use client"

import { useEffect, useMemo } from "react"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useGetBatchQuery } from "@/features/batch/api"
import { useGetCourseQuery, useListCoursesQuery } from "@/features/course/api"
import { CHAPTER, COURSE } from "@/lib/product-vocabulary"
import { DeliveryMode } from "@/types/api"

const NONE = "__none__"

export interface CurriculumPlacement {
  courseId?: string
  subjectId?: string | null
  moduleId?: string | null
  lessonId?: string | null
}

interface CurriculumPlacementPickerProps {
  value: CurriculumPlacement
  onChange: (next: CurriculumPlacement) => void
  fixedCourseId?: string
  fixedBatchId?: string
  moduleLabel?: string
  lessonLabel?: string
  hideModuleLesson?: boolean
  subjectLabel?: string
  className?: string
  beforeLesson?: React.ReactNode
}

export function CurriculumPlacementPicker({
  value,
  onChange,
  fixedCourseId,
  fixedBatchId,
  moduleLabel = `${CHAPTER} (optional)`,
  lessonLabel = "Lesson (optional)",
  hideModuleLesson = false,
  subjectLabel = "Subject (optional)",
  className = "grid gap-4 sm:grid-cols-2",
  beforeLesson,
}: CurriculumPlacementPickerProps) {
  const { data: batchData } = useGetBatchQuery(fixedBatchId ?? "", {
    skip: !fixedBatchId,
  })
  const resolvedCourseId = fixedCourseId ?? batchData?.data?.courseId ?? value.courseId ?? ""
  const courseId = resolvedCourseId

  const { data: courseData } = useGetCourseQuery(courseId, { skip: !courseId })
  const { data: coursesList } = useListCoursesQuery(
    { pageSize: 100 },
    { skip: Boolean(fixedCourseId || fixedBatchId) },
  )

  const course = courseData?.data
  const isLive = course?.deliveryMode === DeliveryMode.LIVE

  const subjects = course?.subjects ?? []
  const modules = useMemo(() => {
    if (isLive) {
      const filtered = value.subjectId
        ? subjects.filter((s) => s.id === value.subjectId)
        : subjects
      return filtered.flatMap((s) => s.modules)
    }
    return course?.modules ?? []
  }, [isLive, subjects, course?.modules, value.subjectId])

  const lessons = useMemo(() => {
    if (!value.moduleId) return []
    const mod = modules.find((m) => m.id === value.moduleId)
    return mod?.lessons ?? []
  }, [modules, value.moduleId])

  useEffect(() => {
    const nextCourseId = fixedCourseId ?? batchData?.data?.courseId
    if (nextCourseId && value.courseId !== nextCourseId) {
      onChange({ ...value, courseId: nextCourseId, subjectId: null, moduleId: null, lessonId: null })
    }
  }, [fixedCourseId, batchData?.data?.courseId, value, onChange])

  const showCoursePicker = !fixedCourseId && !fixedBatchId

  return (
    <div className={className}>
      {showCoursePicker ? (
        <div className="space-y-2 sm:col-span-2">
          <Label>{COURSE}</Label>
          <Select
            value={courseId || NONE}
            onValueChange={(id) => {
              if (id === NONE) return
              onChange({ courseId: id, subjectId: null, moduleId: null, lessonId: null })
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder={`Select ${COURSE.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              {(coursesList?.data ?? []).map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : course ? (
        <div className="space-y-2 sm:col-span-2">
          <Label>{COURSE}</Label>
          <p className="text-sm text-muted-foreground">{course.title}</p>
        </div>
      ) : null}

      {isLive && subjects.length > 0 ? (
        <div className="space-y-2">
          <Label>{subjectLabel}</Label>
          <Select
            value={value.subjectId ?? NONE}
            onValueChange={(id) =>
              onChange({
                ...value,
                courseId,
                subjectId: id === NONE ? null : id,
                moduleId: null,
                lessonId: null,
              })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="All subjects" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NONE}>All subjects</SelectItem>
              {subjects.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : null}

      {!hideModuleLesson ? (
        <>
      <div className="space-y-2">
        <Label>{moduleLabel}</Label>
        <Select
          value={value.moduleId ?? NONE}
          onValueChange={(id) =>
            onChange({
              ...value,
              courseId,
              moduleId: id === NONE ? null : id,
              lessonId: null,
            })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder={`Select ${CHAPTER.toLowerCase()}`} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={NONE}>None</SelectItem>
            {modules.map((m) => (
              <SelectItem key={m.id} value={m.id}>
                {m.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {beforeLesson}

      <div className="space-y-2">
        <Label>{lessonLabel}</Label>
        <Select
          value={value.lessonId ?? NONE}
          onValueChange={(id) =>
            onChange({ ...value, courseId, lessonId: id === NONE ? null : id })
          }
          disabled={!value.moduleId}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select lesson" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={NONE}>None</SelectItem>
            {lessons.map((l) => (
              <SelectItem key={l.id} value={l.id}>
                {l.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
        </>
      ) : null}
    </div>
  )
}
