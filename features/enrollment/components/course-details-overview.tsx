"use client"

import Link from "next/link"
import { Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useGetEnrollmentQuery } from "@/features/enrollment/api"
import { enrollmentCourseId, enrollmentProductTitle } from "@/features/enrollment/curriculum"
import { useGetCourseQuery } from "@/features/course/api"
import { ExpandableRichContent } from "@/components/expandable-rich-content"
import { FAQAccordion } from "@/components/faq-accordion"
import { StudentPageShell } from "@/components/student/student-page-shell"

export function CourseDetailsOverview({ enrollmentId }: { enrollmentId: string }) {
  const { data, isLoading, error } = useGetEnrollmentQuery(enrollmentId)
  const enrollment = data?.data
  const courseId = enrollment ? enrollmentCourseId(enrollment) : ""

  const {
    data: courseData,
    isLoading: courseLoading,
    error: courseError,
  } = useGetCourseQuery(courseId, { skip: !courseId })

  const course = courseData?.data
  const title = enrollment ? enrollmentProductTitle(enrollment) : "Course Details"

  if (isLoading || courseLoading) {
    return (
      <StudentPageShell title="Course Details">
        <p className="text-muted-foreground">Loading…</p>
      </StudentPageShell>
    )
  }

  if (error || !enrollment || courseError || !course) {
    return (
      <StudentPageShell title="Course Details">
        <p className="text-destructive">Course not found.</p>
      </StudentPageShell>
    )
  }

  return (
    <StudentPageShell title={title}>
      <div className="space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground md:text-3xl">{title}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {course.isPublished ? "Published" : "Draft"}
            </p>
          </div>
          <Button
            asChild
            className="rounded-lg bg-secondary px-5 text-primary hover:bg-secondary/90"
          >
            <Link href={`/dashboard/reviews?enrollmentId=${enrollmentId}`}>
              <Star className="mr-2 h-4 w-4" />
              Review
            </Link>
          </Button>
        </div>

        {course.description ? <ExpandableRichContent html={course.description} /> : null}

        {course.faq?.length ? (
          <section className="rounded-[20px] bg-card p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-bold text-foreground">Frequently Asked Questions</h2>
            <FAQAccordion items={course.faq} />
          </section>
        ) : null}

        {!course.description && !course.faq?.length ? (
          <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
            Course details have not been added yet.
          </p>
        ) : null}
      </div>
    </StudentPageShell>
  )
}
