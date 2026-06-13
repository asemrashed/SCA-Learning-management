"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CurriculumTree } from "@/features/course/components/curriculum-tree"
import { useGetCourseQuery } from "@/features/course/api"
import { LiveSessionsPanel } from "@/features/liveclass/components/live-sessions-panel"
import { formatBdtMinor } from "@/lib/format-currency"
import { EnrollmentKind } from "@/types/api"

interface CourseDashboardPreviewProps {
  courseId: string
  backHref: string
  backLabel?: string
  editHref?: string
}

export function CourseDashboardPreview({
  courseId,
  backHref,
  backLabel = "Back",
  editHref,
}: CourseDashboardPreviewProps) {
  const { data, isLoading, error } = useGetCourseQuery(courseId)
  const course = data?.data

  if (isLoading) return <p className="text-muted-foreground">Loading course…</p>
  if (error || !course) return <p className="text-destructive">Course not found.</p>

  return (
    <div className="space-y-8">
      <div>
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link href={backHref}>← {backLabel}</Link>
        </Button>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            {course.category ? (
              <Badge variant="secondary" className="mb-2">
                {course.category}
              </Badge>
            ) : null}
            <h1 className="text-2xl font-bold">{course.title}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {course.isPublished ? "Published" : "Draft"} ·{" "}
              {course.priceMinor === 0 ? "Free" : formatBdtMinor(course.priceMinor)}
            </p>
          </div>
          {editHref ? (
            <Button asChild variant="outline" className="rounded-xl">
              <Link href={editHref}>Edit course</Link>
            </Button>
          ) : null}
        </div>
        {course.description ? (
          <p className="mt-4 text-muted-foreground">{course.description}</p>
        ) : null}
      </div>

      <LiveSessionsPanel kind={EnrollmentKind.COURSE} productId={course.id} />

      <section>
        <h2 className="mb-4 text-lg font-semibold">Curriculum</h2>
        <CurriculumTree modules={course.modules} initialVisible={999} />
      </section>
    </div>
  )
}
