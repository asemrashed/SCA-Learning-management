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
import {
  useGetBatchQuery,
  useGetBatchCurriculumQuery,
  useListBatchesByCourseQuery,
} from "@/features/batch/api"
import { useGetCourseQuery, useListCoursesQuery } from "@/features/course/api"
import { BATCH, CHAPTER, COURSE } from "@/lib/product-vocabulary"
import { DeliveryMode, type CourseSubject } from "@/types/api"

const NONE = "__none__"

export interface CurriculumPlacement {
  courseId?: string
  batchId?: string | null
  subjectId?: string | null
  moduleId?: string | null
  lessonId?: string | null
}

interface CurriculumPlacementPickerProps {
  value: CurriculumPlacement
  onChange: (next: CurriculumPlacement) => void
  fixedCourseId?: string
  fixedBatchId?: string
  requireBatch?: boolean
  subjectRequired?: boolean
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
  requireBatch = false,
  subjectRequired = false,
  moduleLabel = `${CHAPTER} (optional)`,
  lessonLabel = "Lesson (optional)",
  hideModuleLesson = false,
  subjectLabel,
  className = "grid gap-4 sm:grid-cols-2",
  beforeLesson,
}: CurriculumPlacementPickerProps) {
  const { data: fixedBatchData } = useGetBatchQuery(fixedBatchId ?? "", {
    skip: !fixedBatchId,
  })
  const resolvedCourseId =
    fixedCourseId ?? fixedBatchData?.data?.courseId ?? value.courseId ?? ""
  const resolvedBatchId = fixedBatchId ?? value.batchId ?? ""

  const { data: courseData } = useGetCourseQuery(resolvedCourseId, {
    skip: !resolvedCourseId,
  })
  const { data: coursesList } = useListCoursesQuery(
    { pageSize: 100 },
    { skip: Boolean(fixedCourseId || fixedBatchId) },
  )
  const { data: batchesData } = useListBatchesByCourseQuery(resolvedCourseId, {
    skip: !resolvedCourseId,
  })
  const { data: batchCurriculumData } = useGetBatchCurriculumQuery(resolvedBatchId, {
    skip: !resolvedBatchId,
  })

  const course = courseData?.data
  const isLive = course?.deliveryMode === DeliveryMode.LIVE
  const batches = batchesData?.data ?? []
  const subjects: CourseSubject[] = isLive ? (batchCurriculumData?.data ?? []) : []

  const modules = useMemo(() => {
    if (isLive) {
      const filtered = value.subjectId
        ? subjects.filter((s) => s.id === value.subjectId)
        : subjects
      return filtered.flatMap((s) => s.modules ?? [])
    }
    return course?.modules ?? []
  }, [isLive, subjects, course?.modules, value.subjectId])

  const lessons = useMemo(() => {
    if (!value.moduleId) return []
    const mod = modules.find((m) => m.id === value.moduleId)
    return mod?.lessons ?? []
  }, [modules, value.moduleId])

  useEffect(() => {
    const nextCourseId = fixedCourseId ?? fixedBatchData?.data?.courseId
    if (nextCourseId && value.courseId !== nextCourseId) {
      onChange({
        ...value,
        courseId: nextCourseId,
        batchId: fixedBatchId ?? null,
        subjectId: null,
        moduleId: null,
        lessonId: null,
      })
    }
  }, [fixedCourseId, fixedBatchId, fixedBatchData?.data?.courseId, value, onChange])

  useEffect(() => {
    if (fixedBatchId && value.batchId !== fixedBatchId) {
      onChange({ ...value, batchId: fixedBatchId, subjectId: null, moduleId: null, lessonId: null })
    }
  }, [fixedBatchId, value, onChange])

  const showCoursePicker = !fixedCourseId && !fixedBatchId
  const showBatchPicker = isLive && !fixedBatchId && (requireBatch || batches.length > 0)
  const resolvedSubjectLabel =
    subjectLabel ?? (subjectRequired ? "Subject" : "Subject (optional)")

  return (
    <div className={className}>
      {showCoursePicker ? (
        <div className="space-y-2 sm:col-span-2">
          <Label>{COURSE}</Label>
          <Select
            value={resolvedCourseId || NONE}
            onValueChange={(id) => {
              if (id === NONE) return
              onChange({
                courseId: id,
                batchId: null,
                subjectId: null,
                moduleId: null,
                lessonId: null,
              })
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

      {showBatchPicker ? (
        <div className="space-y-2 sm:col-span-2">
          <Label>{BATCH}{requireBatch ? "" : " (optional)"}</Label>
          <Select
            value={value.batchId ?? NONE}
            onValueChange={(id) =>
              onChange({
                ...value,
                courseId: resolvedCourseId,
                batchId: id === NONE ? null : id,
                subjectId: null,
                moduleId: null,
                lessonId: null,
              })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder={`Select ${BATCH.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              {!requireBatch ? <SelectItem value={NONE}>None</SelectItem> : null}
              {batches.map((batch) => (
                <SelectItem key={batch.id} value={batch.id}>
                  {batch.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : fixedBatchId && fixedBatchData?.data ? (
        <div className="space-y-2 sm:col-span-2">
          <Label>{BATCH}</Label>
          <p className="text-sm text-muted-foreground">{fixedBatchData.data.title}</p>
        </div>
      ) : null}

      {isLive && resolvedBatchId && subjects.length > 0 ? (
        <div className="space-y-2">
          <Label>{resolvedSubjectLabel}</Label>
          <Select
            value={value.subjectId ?? NONE}
            onValueChange={(id) =>
              onChange({
                ...value,
                courseId: resolvedCourseId,
                batchId: resolvedBatchId,
                subjectId: id === NONE ? null : id,
                moduleId: null,
                lessonId: null,
              })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder={subjectRequired ? "Select subject" : "All subjects"} />
            </SelectTrigger>
            <SelectContent>
              {!subjectRequired ? <SelectItem value={NONE}>All subjects</SelectItem> : null}
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
                  courseId: resolvedCourseId,
                  batchId: resolvedBatchId || value.batchId,
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
                onChange({
                  ...value,
                  courseId: resolvedCourseId,
                  batchId: resolvedBatchId || value.batchId,
                  lessonId: id === NONE ? null : id,
                })
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
