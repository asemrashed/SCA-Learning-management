"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useGetEnrollmentQuery } from "@/features/enrollment/api"
import {
  enrollmentCourseId,
  enrollmentProductTitle,
  getEnrollmentSubjects,
} from "@/features/enrollment/curriculum"
import { useListResourcesQuery } from "@/features/resource/api"
import { SecurePdfViewer } from "@/components/secure-pdf-viewer"
import { StudentPageShell } from "@/components/student/student-page-shell"
import type { ResourceCategory } from "@/types/api"

interface CourseResourcePageProps {
  enrollmentId: string
  category: ResourceCategory
  pageTitle: string
}

export function CourseResourcePage({
  enrollmentId,
  category,
  pageTitle,
}: CourseResourcePageProps) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const { data, isLoading, error } = useGetEnrollmentQuery(enrollmentId)
  const enrollment = data?.data
  const courseId = enrollment ? enrollmentCourseId(enrollment) : ""

  const resourcesQuery = useListResourcesQuery(
    { courseId, category, pageSize: 100, sort: "createdAt:desc" },
    { skip: !courseId },
  )

  const subjectIds = useMemo(() => {
    if (!enrollment) return new Set<string>()
    return new Set(getEnrollmentSubjects(enrollment).map((s) => s.id))
  }, [enrollment])

  const items = useMemo(() => {
    const all = resourcesQuery.data?.data ?? []
    if (!enrollment) return all
    return all.filter(
      (r) => !r.subjectId || subjectIds.has(r.subjectId),
    )
  }, [resourcesQuery.data?.data, enrollment, subjectIds])

  const active = items.find((r) => r.id === activeId) ?? null
  const courseTitle = enrollment ? enrollmentProductTitle(enrollment) : pageTitle

  useEffect(() => {
    if (items.length > 0 && !activeId) {
      setActiveId(items[0].id)
    }
  }, [items, activeId])

  if (isLoading) {
    return (
      <StudentPageShell title={pageTitle}>
        <p className="text-muted-foreground">Loading…</p>
      </StudentPageShell>
    )
  }

  if (error || !enrollment) {
    return (
      <StudentPageShell title={pageTitle}>
        <p className="text-destructive">Course not found.</p>
      </StudentPageShell>
    )
  }

  return (
    <StudentPageShell title={courseTitle}>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/dashboard/courses/${enrollmentId}`}>
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to course
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">{pageTitle}</h1>
      </div>

      {resourcesQuery.isLoading ? (
        <p className="text-sm text-muted-foreground">Loading documents…</p>
      ) : resourcesQuery.error ? (
        <p className="text-sm text-destructive">Could not load documents.</p>
      ) : items.length === 0 ? (
        <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
          No {pageTitle.toLowerCase()} uploaded yet.
        </p>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <ul className="divide-y rounded-xl border bg-card">
            {items.map((resource) => (
              <li key={resource.id}>
                <button
                  type="button"
                  onClick={() => setActiveId(resource.id)}
                  className={`w-full px-4 py-3 text-left text-sm transition-colors hover:bg-muted/50 ${
                    activeId === resource.id ? "bg-muted font-medium" : ""
                  }`}
                >
                  <span className="line-clamp-2">{resource.title}</span>
                </button>
              </li>
            ))}
          </ul>

          <div className="min-h-[70vh]">
            {active ? (
              <SecurePdfViewer resourceId={active.id} title={active.title} />
            ) : (
              <div className="flex h-full min-h-[50vh] items-center justify-center rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
                Select a document from the list to view.
              </div>
            )}
          </div>
        </div>
      )}
    </StudentPageShell>
  )
}
