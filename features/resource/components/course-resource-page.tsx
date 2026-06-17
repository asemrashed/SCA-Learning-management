"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Send } from "lucide-react"
import { useSelector } from "react-redux"
import { Button } from "@/components/ui/button"
import { useGetEnrollmentQuery } from "@/features/enrollment/api"
import {
  enrollmentCourseId,
  enrollmentBatchId,
  enrollmentProductTitle,
  getEnrollmentSubjects,
} from "@/features/enrollment/curriculum"
import { useListResourcesQuery } from "@/features/resource/api"
import { SecurePdfViewer } from "@/components/secure-pdf-viewer"
import { StudentPageShell } from "@/components/student/student-page-shell"
import {
  assignmentSubmitMessage,
  examSubmitMessage,
  whatsappUrl,
} from "@/lib/whatsapp"
import type { RootState } from "@/store/rootReducer"
import { ResourceCategory } from "@/types/api"
import type { ResourceCategory as ResourceCategoryType } from "@/types/api"

interface CourseResourcePageProps {
  enrollmentId: string
  category: ResourceCategoryType
  pageTitle: string
}

export function CourseResourcePage({
  enrollmentId,
  category,
  pageTitle,
}: CourseResourcePageProps) {
  const user = useSelector((state: RootState) => state.auth.user)
  const [activeId, setActiveId] = useState<string | null>(null)
  const { data, isLoading, error } = useGetEnrollmentQuery(enrollmentId)
  const enrollment = data?.data
  const courseId = enrollment ? enrollmentCourseId(enrollment) : ""
  const batchId = enrollment ? enrollmentBatchId(enrollment) : null

  const resourcesQuery = useListResourcesQuery(
    {
      courseId,
      ...(batchId ? { batchId } : {}),
      category,
      pageSize: 100,
      sort: "createdAt:desc",
    },
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
  const showSubmit =
    category === ResourceCategory.EXAM || category === ResourceCategory.ASSIGNMENT
  const submitHref =
    showSubmit && enrollment
      ? whatsappUrl(
          category === ResourceCategory.EXAM
            ? examSubmitMessage(courseTitle, user?.name ?? "Student")
            : assignmentSubmitMessage(courseTitle, user?.name ?? "Student"),
        )
      : null

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
        {submitHref ? (
          <Button asChild className="ml-auto rounded-xl">
            <a href={submitHref} target="_blank" rel="noopener noreferrer">
              <Send className="mr-2 h-4 w-4" />
              Submit
            </a>
          </Button>
        ) : null}
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
                  {resource.deadlineAt ? (
                    <span className="mt-1 block text-xs text-muted-foreground">
                      Deadline:{" "}
                      {new Date(resource.deadlineAt).toLocaleString(undefined, {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </span>
                  ) : null}
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
