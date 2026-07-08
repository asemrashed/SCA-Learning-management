"use client"

import { useEffect } from "react"
import { FilterPills } from "@/components/filter-pills"
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
import { BATCH, COURSE } from "@/lib/product-vocabulary"
import type { EnrollmentDetail } from "@/types/api"
import { EnrollmentKind } from "@/types/api"

export interface StudentResourceFilterValues {
  subjectId: string
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
  /** Hide course/batch display dropdowns when already scoped to an enrollment. */
  hideScope?: boolean
  /** Use pill buttons for subject selection (like recorded classes). */
  subjectDisplay?: "dropdown" | "pills"
}

export function StudentResourceFilters({
  enrollment,
  values,
  onChange,
  enrollmentPicker,
  hideScope = false,
  subjectDisplay = "dropdown",
}: StudentResourceFiltersProps) {
  const subjects = getEnrollmentSubjects(enrollment)
  const courseTitle =
    enrollment.kind === EnrollmentKind.BATCH
      ? (enrollment.course?.title ?? enrollmentProductTitle(enrollment))
      : enrollmentProductTitle(enrollment)
  const batchTitle = enrollment.kind === EnrollmentKind.BATCH ? enrollment.batch?.title : null
  const batchId = enrollmentBatchId(enrollment)
  const courseId = enrollmentCourseId(enrollment)

  const selectedSubjectId =
    values.subjectId || (subjectDisplay === "pills" ? (subjects[0]?.id ?? "") : "")

  useEffect(() => {
    if (subjectDisplay !== "pills" || subjects.length === 0) return
    if (!values.subjectId && subjects[0]) {
      onChange({ subjectId: subjects[0].id })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subjectDisplay, subjects, values.subjectId])

  function patch(partial: Partial<StudentResourceFilterValues>) {
    onChange({ ...values, ...partial })
  }

  const showDropdownRow =
    Boolean(enrollmentPicker) ||
    (!hideScope && Boolean(courseId)) ||
    subjectDisplay === "dropdown"

  return (
    <div className="mb-6 space-y-4">
      {subjectDisplay === "pills" && subjects.length > 0 ? (
        <FilterPills
          options={subjects.map((subject) => ({
            value: subject.id,
            label: subject.title,
          }))}
          value={selectedSubjectId}
          onChange={(subjectId) => patch({ subjectId })}
        />
      ) : null}

      {showDropdownRow ? (
        <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center">
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
          ) : hideScope ? null : (
            <Select value={courseId} disabled>
              <SelectTrigger className="w-full lg:w-[200px]">
                <SelectValue placeholder={COURSE} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={courseId}>{courseTitle}</SelectItem>
              </SelectContent>
            </Select>
          )}

          {!hideScope && batchId && batchTitle ? (
            <Select value={batchId} disabled>
              <SelectTrigger className="w-full lg:w-[200px]">
                <SelectValue placeholder={BATCH} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={batchId}>{batchTitle}</SelectItem>
              </SelectContent>
            </Select>
          ) : null}

          {subjectDisplay === "dropdown" ? (
            <Select
              value={values.subjectId || "all"}
              onValueChange={(v) => patch({ subjectId: v === "all" ? "" : v })}
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
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
