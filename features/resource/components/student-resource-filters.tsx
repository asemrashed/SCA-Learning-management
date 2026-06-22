"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  enrollmentBatchId,
  enrollmentCourseId,
  enrollmentProductTitle,
  getEnrollmentSubjects,
} from "@/features/enrollment/curriculum"
import { BATCH, CHAPTER, COURSE } from "@/lib/product-vocabulary"
import type { EnrollmentDetail } from "@/types/api"
import { EnrollmentKind } from "@/types/api"

export interface StudentResourceFilterValues {
  subjectId: string
  moduleId: string
}

interface StudentResourceFiltersProps {
  enrollment: EnrollmentDetail
  values: StudentResourceFilterValues
  onChange: (values: StudentResourceFilterValues) => void
  enrollmentPicker?: {
    options: { id: string; label: string }[]
    selectedId: string
    onSelect: (id: string) => void
  }
}

export function StudentResourceFilters({
  enrollment,
  values,
  onChange,
  enrollmentPicker,
}: StudentResourceFiltersProps) {
  const subjects = getEnrollmentSubjects(enrollment)
  const selectedSubject = subjects.find((s) => s.id === values.subjectId) ?? null
  const modules = selectedSubject?.modules ?? []
  const showChapterFilter = modules.length > 0
  const courseTitle =
    enrollment.kind === EnrollmentKind.BATCH
      ? (enrollment.course?.title ?? enrollmentProductTitle(enrollment))
      : enrollmentProductTitle(enrollment)
  const batchTitle = enrollment.kind === EnrollmentKind.BATCH ? enrollment.batch?.title : null
  const batchId = enrollmentBatchId(enrollment)
  const courseId = enrollmentCourseId(enrollment)

  function patch(partial: Partial<StudentResourceFilterValues>) {
    onChange({ ...values, ...partial })
  }

  return (
    <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center">
      {enrollmentPicker ? (
        <Select value={enrollmentPicker.selectedId} onValueChange={enrollmentPicker.onSelect}>
          <SelectTrigger className="w-full lg:w-[200px]">
            <SelectValue placeholder={`Select ${COURSE.toLowerCase()}`} />
          </SelectTrigger>
          <SelectContent>
            {enrollmentPicker.options.map((option) => (
              <SelectItem key={option.id} value={option.id}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <Select value={courseId} disabled>
          <SelectTrigger className="w-full lg:w-[200px]">
            <SelectValue placeholder={COURSE} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={courseId}>{courseTitle}</SelectItem>
          </SelectContent>
        </Select>
      )}

      {batchId && batchTitle ? (
        <Select value={batchId} disabled>
          <SelectTrigger className="w-full lg:w-[200px]">
            <SelectValue placeholder={BATCH} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={batchId}>{batchTitle}</SelectItem>
          </SelectContent>
        </Select>
      ) : null}

      <Select
        value={values.subjectId || "all"}
        onValueChange={(v) => patch({ subjectId: v === "all" ? "" : v, moduleId: "" })}
      >
        <SelectTrigger className="w-full lg:w-[200px]">
          <SelectValue placeholder="All subjects" />
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

      {showChapterFilter ? (
        <Select
          value={values.moduleId || "all"}
          onValueChange={(v) => patch({ moduleId: v === "all" ? "" : v })}
          disabled={!values.subjectId}
        >
          <SelectTrigger className="w-full lg:w-[200px]">
            <SelectValue
              placeholder={
                values.subjectId ? `All ${CHAPTER.toLowerCase()}s` : "Select subject first"
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
    </div>
  )
}
