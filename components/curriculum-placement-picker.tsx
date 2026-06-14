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
import { useGetBatchQuery, useListBatchesQuery } from "@/features/batch/api"
import { useGetCourseQuery, useListCoursesQuery } from "@/features/course/api"
import { SHOW_RECORDED_COURSES, learningSystemLabel, LIVE_COURSE, CHAPTER } from "@/lib/product-vocabulary"

const NONE = "__none__"

export interface CurriculumPlacement {
  scope: "batch" | "course"
  batchId?: string
  courseId?: string
  subjectId?: string | null
  moduleId?: string | null
  lessonId?: string | null
}

interface CurriculumPlacementPickerProps {
  value: CurriculumPlacement
  onChange: (next: CurriculumPlacement) => void
  fixedBatchId?: string
  fixedCourseId?: string
  showScopeToggle?: boolean
  moduleLabel?: string
  lessonLabel?: string
  /** Pass `contents` to participate in a parent CSS grid */
  className?: string
  /** Extra field rendered beside lesson (e.g. total marks) */
  beforeLesson?: React.ReactNode
}

export function CurriculumPlacementPicker({
  value,
  onChange,
  fixedBatchId,
  fixedCourseId,
  showScopeToggle = true,
  moduleLabel = `${CHAPTER} (optional)`,
  lessonLabel = "Lesson (optional)",
  className = "grid gap-4 sm:grid-cols-2",
  beforeLesson,
}: CurriculumPlacementPickerProps) {
  const scope = fixedBatchId ? "batch" : fixedCourseId ? "course" : value.scope
  const batchId = fixedBatchId ?? value.batchId ?? ""
  const courseId = fixedCourseId ?? value.courseId ?? ""

  const { data: batchData } = useGetBatchQuery(batchId, { skip: scope !== "batch" || !batchId })
  const { data: courseData } = useGetCourseQuery(courseId, { skip: scope !== "course" || !courseId })

  const modules = useMemo(() => {
    if (scope === "batch" && batchData?.data) {
      const subjects = value.subjectId
        ? batchData.data.subjects.filter((s) => s.id === value.subjectId)
        : batchData.data.subjects
      return subjects.flatMap((s) => s.modules)
    }
    if (scope === "course" && courseData?.data) {
      return courseData.data.modules
    }
    return []
  }, [scope, batchData, courseData, value.subjectId])

  const lessons = useMemo(() => {
    if (!value.moduleId) return []
    const mod = modules.find((m) => m.id === value.moduleId)
    return mod?.lessons ?? []
  }, [modules, value.moduleId])

  useEffect(() => {
    if (fixedBatchId && value.batchId !== fixedBatchId) {
      onChange({ ...value, scope: "batch", batchId: fixedBatchId, courseId: undefined })
    }
    if (fixedCourseId && value.courseId !== fixedCourseId) {
      onChange({ ...value, scope: "course", courseId: fixedCourseId, batchId: undefined })
    }
  }, [fixedBatchId, fixedCourseId, value, onChange])

  function setScope(nextScope: "batch" | "course") {
    onChange({
      scope: nextScope,
      batchId: nextScope === "batch" ? value.batchId : undefined,
      courseId: nextScope === "course" ? value.courseId : undefined,
      subjectId: null,
      moduleId: null,
      lessonId: null,
    })
  }

  const effectiveShowScopeToggle = showScopeToggle && SHOW_RECORDED_COURSES

  const showProductPicker = !fixedBatchId && !fixedCourseId

  return (
    <div className={className}>
      {showProductPicker && effectiveShowScopeToggle ? (
        <>
          <div className="space-y-2">
            <Label>Learning system</Label>
            <Select value={scope} onValueChange={(v) => setScope(v as "batch" | "course")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="batch">{learningSystemLabel("batch")}</SelectItem>
                <SelectItem value="course">{learningSystemLabel("course")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>{learningSystemLabel(scope)}</Label>
            {scope === "batch" ? (
              <BatchSelect
                value={batchId}
                onChange={(id) =>
                  onChange({
                    ...value,
                    scope: "batch",
                    batchId: id,
                    subjectId: null,
                    moduleId: null,
                    lessonId: null,
                  })
                }
              />
            ) : (
              <CourseSelect
                value={courseId}
                onChange={(id) =>
                  onChange({
                    ...value,
                    scope: "course",
                    courseId: id,
                    moduleId: null,
                    lessonId: null,
                  })
                }
              />
            )}
          </div>
        </>
      ) : null}

      {showProductPicker && !effectiveShowScopeToggle ? (
        <div className="space-y-2">
          <Label>{LIVE_COURSE}</Label>
          <BatchSelect
            value={batchId}
            onChange={(id) =>
              onChange({
                ...value,
                scope: "batch",
                batchId: id,
                courseId: undefined,
                subjectId: null,
                moduleId: null,
                lessonId: null,
              })
            }
          />
        </div>
      ) : null}

      {scope === "batch" && batchId ? (
        <div className="space-y-2">
          <Label>Subject (optional)</Label>
          <Select
            value={value.subjectId ?? NONE}
            onValueChange={(subjectId) => {
              onChange({
                ...value,
                subjectId: subjectId === NONE ? null : subjectId,
                moduleId: null,
                lessonId: null,
              })
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="All subjects / standalone" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NONE}>All subjects / standalone</SelectItem>
              {batchData?.data.subjects.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : (
        <div className="hidden sm:block" aria-hidden />
      )}

      <div className="space-y-2">
        <Label>{moduleLabel}</Label>
        <Select
          value={value.moduleId ?? NONE}
          onValueChange={(id) =>
            onChange({
              ...value,
              moduleId: id === NONE ? null : id,
              lessonId: null,
            })
          }
          disabled={scope === "batch" && Boolean(batchId) && !batchData}
        >
          <SelectTrigger>
            <SelectValue placeholder="None" />
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

      {beforeLesson ?? null}

      <div className="space-y-2">
        <Label>{lessonLabel}</Label>
        <Select
          value={value.lessonId ?? NONE}
          onValueChange={(id) =>
            onChange({ ...value, lessonId: id === NONE ? null : id })
          }
          disabled={!value.moduleId}
        >
          <SelectTrigger>
            <SelectValue placeholder="None" />
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
    </div>
  )
}

function BatchSelect({ value, onChange }: { value: string; onChange: (id: string) => void }) {
  const { data } = useListBatchesQuery({ pageSize: 100 })
  const batches = data?.data ?? []
  return (
    <Select value={value || undefined} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder={`Select ${LIVE_COURSE.toLowerCase()}`} />
      </SelectTrigger>
      <SelectContent>
        {batches.map((b) => (
          <SelectItem key={b.id} value={b.id}>
            {b.title}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

function CourseSelect({ value, onChange }: { value: string; onChange: (id: string) => void }) {
  const { data } = useListCoursesQuery({ pageSize: 100 })
  const courses = data?.data ?? []
  return (
    <Select value={value || undefined} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder="Select course" />
      </SelectTrigger>
      <SelectContent>
        {courses.map((c) => (
          <SelectItem key={c.id} value={c.id}>
            {c.title}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
