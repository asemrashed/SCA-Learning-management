"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useGetEnrollmentQuery, useListEnrollmentsQuery } from "@/features/enrollment/api"
import {
  enrollmentBatchId,
  enrollmentCourseId,
  enrollmentProductTitle,
} from "@/features/enrollment/curriculum"
import { useListResourcesQuery } from "@/features/resource/api"
import { SecurePdfViewer } from "@/components/secure-pdf-viewer"
import { StudentPageShell } from "@/components/student/student-page-shell"
import { useAuthQuerySkip } from "@/features/auth/hooks"
import { cn } from "@/lib/utils"
import { EnrollmentKind, EnrollmentStatus, ResourceCategory } from "@/types/api"

const SUGGESTION_TABS = [
  { id: "math" as const, label: "Math Suggestion", category: ResourceCategory.MATH_SUGGESTION },
  {
    id: "theory" as const,
    label: "Theory Suggestion",
    category: ResourceCategory.THEORY_SUGGESTION,
  },
]

interface SuggestionPageProps {
  enrollmentId?: string
}

export function SuggestionPage({ enrollmentId: fixedEnrollmentId }: SuggestionPageProps) {
  const skipAuth = useAuthQuerySkip()
  const [activeTab, setActiveTab] = useState<(typeof SUGGESTION_TABS)[number]["id"]>("math")
  const [activeId, setActiveId] = useState<string | null>(null)
  const [selectedEnrollmentId, setSelectedEnrollmentId] = useState<string | null>(
    fixedEnrollmentId ?? null,
  )

  const { data: enrollmentsData, isLoading: enrollmentsLoading } = useListEnrollmentsQuery(
    undefined,
    { skip: skipAuth || Boolean(fixedEnrollmentId) },
  )

  const accessibleEnrollments = useMemo(() => {
    return (enrollmentsData?.data ?? []).filter(
      (e) =>
        e.status === EnrollmentStatus.ACTIVE ||
        e.status === EnrollmentStatus.COMPLETED ||
        e.status === EnrollmentStatus.PENDING,
    )
  }, [enrollmentsData?.data])

  const enrollmentId =
    fixedEnrollmentId ?? selectedEnrollmentId ?? accessibleEnrollments[0]?.id ?? null

  useEffect(() => {
    if (!fixedEnrollmentId && !selectedEnrollmentId && accessibleEnrollments[0]?.id) {
      setSelectedEnrollmentId(accessibleEnrollments[0].id)
    }
  }, [fixedEnrollmentId, selectedEnrollmentId, accessibleEnrollments])

  const category =
    SUGGESTION_TABS.find((tab) => tab.id === activeTab)?.category ??
    ResourceCategory.MATH_SUGGESTION

  const { data, isLoading, error } = useGetEnrollmentQuery(enrollmentId ?? "", {
    skip: !enrollmentId,
  })
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

  const items = resourcesQuery.data?.data ?? []

  const active = items.find((r) => r.id === activeId) ?? null
  const courseTitle = enrollment ? enrollmentProductTitle(enrollment) : "Suggestion"
  const showCoursePicker = !fixedEnrollmentId && accessibleEnrollments.length > 1

  useEffect(() => {
    setActiveId(null)
  }, [category, enrollmentId])

  useEffect(() => {
    if (items.length > 0 && !activeId) {
      setActiveId(items[0].id)
    }
  }, [items, activeId])

  if (!fixedEnrollmentId && enrollmentsLoading) {
    return (
      <StudentPageShell title="Suggestion">
        <p className="text-muted-foreground">Loading…</p>
      </StudentPageShell>
    )
  }

  if (!fixedEnrollmentId && accessibleEnrollments.length === 0) {
    return (
      <StudentPageShell title="Suggestion">
        <h1 className="mb-4 text-2xl font-bold">Suggestion</h1>
        <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
          Enroll in a course to view suggestions.
        </p>
      </StudentPageShell>
    )
  }

  if (isLoading) {
    return (
      <StudentPageShell title="Suggestion">
        <p className="text-muted-foreground">Loading…</p>
      </StudentPageShell>
    )
  }

  if (error || !enrollment) {
    return (
      <StudentPageShell title="Suggestion">
        <p className="text-destructive">Course not found.</p>
      </StudentPageShell>
    )
  }

  return (
    <StudentPageShell title={fixedEnrollmentId ? courseTitle : "Suggestion"}>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        {fixedEnrollmentId ? (
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/dashboard/courses/${enrollmentId}`}>
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back to course
            </Link>
          </Button>
        ) : null}
        <h1 className="text-2xl font-bold">Suggestion</h1>
      </div>

      {showCoursePicker ? (
        <div className="mb-6 max-w-md">
          <Select
            value={enrollmentId ?? undefined}
            onValueChange={(value) => setSelectedEnrollmentId(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a course" />
            </SelectTrigger>
            <SelectContent>
              {accessibleEnrollments.map((item) => (
                <SelectItem key={item.id} value={item.id}>
                  {item.kind === EnrollmentKind.BATCH ? item.batch?.title : item.course?.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : null}

      <div className="mb-6 flex flex-wrap gap-2">
        {SUGGESTION_TABS.map((tab) => {
          const isActive = tab.id === activeTab
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-muted-foreground hover:border-primary/40",
              )}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      {resourcesQuery.isLoading ? (
        <p className="text-sm text-muted-foreground">Loading documents…</p>
      ) : resourcesQuery.error ? (
        <p className="text-sm text-destructive">Could not load documents.</p>
      ) : items.length === 0 ? (
        <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
          No {SUGGESTION_TABS.find((tab) => tab.id === activeTab)?.label.toLowerCase()} uploaded
          yet.
        </p>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <ul className="divide-y rounded-xl border bg-card">
            {items.map((resource) => (
              <li key={resource.id}>
                <button
                  type="button"
                  onClick={() => setActiveId(resource.id)}
                  className={cn(
                    "w-full px-4 py-3 text-left text-sm transition-colors hover:bg-muted/50",
                    activeId === resource.id && "bg-muted font-medium",
                  )}
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
