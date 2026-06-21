"use client"

import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useListBatchesByCourseQuery, useGetBatchCurriculumQuery } from "@/features/batch/api"
import { useListCoursesQuery } from "@/features/course/api"
import { BATCH, COURSE } from "@/lib/product-vocabulary"
import { DeliveryMode } from "@/types/api"

export const ALL_FILTER = "__all__"

export interface QuestionBankFilterValues {
  courseId: string
  batchId: string
  subjectId: string
}

interface QuestionBankFiltersProps {
  values: QuestionBankFilterValues
  onChange: (values: QuestionBankFilterValues) => void
  layout?: "column" | "row"
}

export function QuestionBankFilters({
  values,
  onChange,
  layout = "column",
}: QuestionBankFiltersProps) {
  const { courseId, batchId, subjectId } = values
  const { data: coursesData } = useListCoursesQuery({
    deliveryMode: DeliveryMode.LIVE,
    pageSize: 100,
  })
  const { data: batchesData } = useListBatchesByCourseQuery(courseId, { skip: !courseId })
  const { data: curriculumData } = useGetBatchCurriculumQuery(batchId, { skip: !batchId })

  const courses = coursesData?.data ?? []
  const batches = batchesData?.data ?? []
  const subjects = curriculumData?.data ?? []

  function patch(partial: Partial<QuestionBankFilterValues>) {
    onChange({ ...values, ...partial })
  }

  const containerClass =
    layout === "column"
      ? "flex flex-col gap-3"
      : "grid grid-cols-1 gap-4 md:grid-cols-3"

  return (
    <div className={containerClass}>
      <div className="space-y-2">
        <Label>{COURSE}</Label>
        <Select
          value={courseId || ALL_FILTER}
          onValueChange={(v) => {
            patch({
              courseId: v === ALL_FILTER ? "" : v,
              batchId: "",
              subjectId: "",
            })
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder={`Select ${COURSE.toLowerCase()}`} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_FILTER}>All {COURSE.toLowerCase()}s</SelectItem>
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
          value={batchId || ALL_FILTER}
          onValueChange={(v) => {
            patch({
              batchId: v === ALL_FILTER ? "" : v,
              subjectId: "",
            })
          }}
          disabled={!courseId}
        >
          <SelectTrigger className="w-full">
            <SelectValue
              placeholder={
                courseId ? `All ${BATCH.toLowerCase()}es` : `Select ${COURSE.toLowerCase()} first`
              }
            />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_FILTER}>All {BATCH.toLowerCase()}es</SelectItem>
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
          value={subjectId || ALL_FILTER}
          onValueChange={(v) => patch({ subjectId: v === ALL_FILTER ? "" : v })}
          disabled={!batchId}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder={batchId ? "All subjects" : `Select ${BATCH.toLowerCase()} first`} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_FILTER}>All subjects</SelectItem>
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
