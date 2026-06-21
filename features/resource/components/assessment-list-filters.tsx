"use client"

import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useListBatchesByCourseQuery, useListBatchesQuery, useGetBatchCurriculumQuery } from "@/features/batch/api"
import { useListCoursesQuery } from "@/features/course/api"
import { BATCH } from "@/lib/product-vocabulary"
import { DeliveryMode } from "@/types/api"

export interface AssessmentListFilterValues {
  courseId: string
  batchId: string
  subjectId: string
  search: string
}

interface AssessmentListFiltersProps {
  values: AssessmentListFilterValues
  onChange: (values: AssessmentListFilterValues) => void
}

export function AssessmentListFilters({ values, onChange }: AssessmentListFiltersProps) {
  const { courseId, batchId, subjectId, search } = values
  const { data: coursesData } = useListCoursesQuery({
    deliveryMode: DeliveryMode.LIVE,
    pageSize: 100,
  })
  const { data: batchesData } = useListBatchesQuery({ pageSize: 100 })
  const { data: courseBatchesData } = useListBatchesByCourseQuery(courseId, { skip: !courseId })
  const { data: curriculumData } = useGetBatchCurriculumQuery(batchId, { skip: !batchId })

  const batchOptions = courseId
    ? (courseBatchesData?.data ?? [])
    : (batchesData?.data ?? [])
  const subjects = curriculumData?.data ?? []

  function patch(partial: Partial<AssessmentListFilterValues>) {
    onChange({ ...values, ...partial })
  }

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center">
      <Select
        value={courseId || "all"}
        onValueChange={(v) =>
          patch({ courseId: v === "all" ? "" : v, batchId: "", subjectId: "" })
        }
      >
        <SelectTrigger className="w-full lg:w-[200px]">
          <SelectValue placeholder="Course" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All courses</SelectItem>
          {(coursesData?.data ?? []).map((course) => (
            <SelectItem key={course.id} value={course.id}>
              {course.title}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={batchId || "all"}
        onValueChange={(v) =>
          patch({ batchId: v === "all" ? "" : v, subjectId: "" })
        }
      >
        <SelectTrigger className="w-full lg:w-[200px]">
          <SelectValue placeholder="Batch" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All batches</SelectItem>
          {batchOptions.map((batch) => (
            <SelectItem key={batch.id} value={batch.id}>
              {batch.title}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={subjectId || "all"}
        onValueChange={(v) => patch({ subjectId: v === "all" ? "" : v })}
        disabled={!batchId}
      >
        <SelectTrigger className="w-full lg:w-[200px]">
          <SelectValue
            placeholder={batchId ? "All subjects" : `Select ${BATCH.toLowerCase()} first`}
          />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All subjects</SelectItem>
          {subjects.map((subject) => (
            <SelectItem key={subject.id} value={subject.id}>
              {subject.title}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Input
        className="w-full lg:min-w-[180px] lg:flex-1"
        placeholder="Search title…"
        value={search}
        onChange={(e) => patch({ search: e.target.value })}
      />
    </div>
  )
}
