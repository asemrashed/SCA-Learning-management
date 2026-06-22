"use client"

import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useListBatchesByCourseQuery, useGetBatchCurriculumQuery } from "@/features/batch/api"
import { useListCoursesQuery } from "@/features/course/api"
import { BATCH, CHAPTER, COURSE } from "@/lib/product-vocabulary"
import { CONTENT_RESOURCE_CATEGORIES, RESOURCE_CATEGORY_LABELS } from "@/lib/resource-categories"
import type { ResourceCategory } from "@/types/api"

export interface ResourceManageFilterValues {
  courseId: string
  batchId: string
  subjectId: string
  moduleId: string
  category: string
  search: string
}

interface ResourceManageFiltersProps {
  values: ResourceManageFilterValues
  onChange: (values: ResourceManageFilterValues) => void
}

export function ResourceManageFilters({ values, onChange }: ResourceManageFiltersProps) {
  const { courseId, batchId, subjectId, moduleId, category, search } = values
  const { data: coursesData } = useListCoursesQuery({ pageSize: 100 })
  const { data: batchesData } = useListBatchesByCourseQuery(courseId, { skip: !courseId })
  const { data: curriculumData } = useGetBatchCurriculumQuery(batchId, { skip: !batchId })

  const batches = batchesData?.data ?? []
  const subjects = curriculumData?.data ?? []
  const selectedSubject = subjects.find((s) => s.id === subjectId) ?? null
  const modules = selectedSubject?.modules ?? []

  function patch(partial: Partial<ResourceManageFilterValues>) {
    onChange({ ...values, ...partial })
  }

  return (
    <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center">
      <Select
        value={courseId || "all"}
        onValueChange={(v) =>
          patch({
            courseId: v === "all" ? "" : v,
            batchId: "",
            subjectId: "",
            moduleId: "",
          })
        }
      >
        <SelectTrigger className="w-full lg:w-[180px]">
          <SelectValue placeholder={COURSE} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All {COURSE.toLowerCase()}s</SelectItem>
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
          patch({
            batchId: v === "all" ? "" : v,
            subjectId: "",
            moduleId: "",
          })
        }
        disabled={!courseId}
      >
        <SelectTrigger className="w-full lg:w-[180px]">
          <SelectValue
            placeholder={courseId ? `All ${BATCH.toLowerCase()}es` : `Select ${COURSE.toLowerCase()} first`}
          />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All {BATCH.toLowerCase()}es</SelectItem>
          {batches.map((batch) => (
            <SelectItem key={batch.id} value={batch.id}>
              {batch.title}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={subjectId || "all"}
        onValueChange={(v) => patch({ subjectId: v === "all" ? "" : v, moduleId: "" })}
        disabled={!batchId}
      >
        <SelectTrigger className="w-full lg:w-[180px]">
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

      {modules.length > 0 ? (
        <Select
          value={moduleId || "all"}
          onValueChange={(v) => patch({ moduleId: v === "all" ? "" : v })}
          disabled={!subjectId}
        >
          <SelectTrigger className="w-full lg:w-[180px]">
            <SelectValue
              placeholder={
                subjectId ? `All ${CHAPTER.toLowerCase()}s` : "Select subject first"
              }
            />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All {CHAPTER.toLowerCase()}s</SelectItem>
            {modules.map((mod) => (
              <SelectItem key={mod.id} value={mod.id}>
                {mod.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : null}

      <Select value={category || "all"} onValueChange={(v) => patch({ category: v === "all" ? "" : v })}>
        <SelectTrigger className="w-full lg:w-[180px]">
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All categories</SelectItem>
          {Array.from(CONTENT_RESOURCE_CATEGORIES).map((cat) => (
            <SelectItem key={cat} value={cat}>
              {RESOURCE_CATEGORY_LABELS[cat as ResourceCategory]}
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
