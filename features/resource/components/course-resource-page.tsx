"use client"

import { useEffect, useMemo, useState } from "react"
import { Send } from "lucide-react"
import { useSelector } from "react-redux"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useGetEnrollmentQuery } from "@/features/enrollment/api"
import {
  enrollmentCourseId,
  enrollmentBatchId,
  enrollmentProductTitle,
  getEnrollmentSubjects,
} from "@/features/enrollment/curriculum"
import { useListResourcesQuery } from "@/features/resource/api"
import {
  useListEnrollmentSubmissionsQuery,
  useSubmitResourceMutation,
} from "@/features/resource-submission/api"
import { SecurePdfViewer } from "@/components/secure-pdf-viewer"
import { StudentPageShell } from "@/components/student/student-page-shell"
import {
  StudentResourceFilters,
  type StudentResourceFilterValues,
} from "@/features/resource/components/student-resource-filters"
import { getApiErrorMessage } from "@/lib/get-api-error-message"
import type { RootState } from "@/store/rootReducer"
import { ResourceCategory, ResourceSubmissionStatus } from "@/types/api"
import type {
  ResourceCategory as ResourceCategoryType,
  ResourceSubmissionRecord,
} from "@/types/api"

const submissionStatusLabel: Record<ResourceSubmissionStatus, string> = {
  [ResourceSubmissionStatus.PENDING]: "Pending review",
  [ResourceSubmissionStatus.ACCEPTED]: "Accepted",
  [ResourceSubmissionStatus.REJECTED]: "Rejected",
}

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
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [filters, setFilters] = useState<StudentResourceFilterValues>({
    subjectId: "",
    moduleId: "",
  })
  const { data, isLoading, error } = useGetEnrollmentQuery(enrollmentId)
  const enrollment = data?.data
  const courseId = enrollment ? enrollmentCourseId(enrollment) : ""
  const batchId = enrollment ? enrollmentBatchId(enrollment) : null

  const resourcesQuery = useListResourcesQuery(
    {
      courseId,
      ...(batchId ? { batchId } : {}),
      category,
      ...(filters.subjectId ? { subjectId: filters.subjectId } : {}),
      ...(filters.moduleId ? { moduleId: filters.moduleId } : {}),
      pageSize: 100,
      sort: "createdAt:desc",
    },
    { skip: !courseId },
  )

  const questionBankQuery = useListResourcesQuery(
    {
      courseId,
      ...(batchId ? { batchId } : {}),
      category: ResourceCategory.QUESTION_BANK,
      pageSize: 100,
    },
    { skip: !courseId || category !== ResourceCategory.EXAM },
  )

  const submissionsQuery = useListEnrollmentSubmissionsQuery(
    {
      enrollmentId,
      category: category as ResourceCategory.EXAM | ResourceCategory.ASSIGNMENT,
    },
    {
      skip:
        !enrollmentId ||
        (category !== ResourceCategory.EXAM && category !== ResourceCategory.ASSIGNMENT),
    },
  )

  const [submitResource, { isLoading: submitting }] = useSubmitResourceMutation()

  const submissionByResourceId = useMemo(() => {
    const map = new Map<string, ResourceSubmissionRecord>()
    for (const item of submissionsQuery.data?.data ?? []) {
      map.set(item.resource.id, item)
    }
    return map
  }, [submissionsQuery.data?.data])

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
  const activeSubmission = active ? submissionByResourceId.get(active.id) : undefined
  const questionBankById = useMemo(() => {
    const map = new Map<string, (typeof items)[number]>()
    for (const question of questionBankQuery.data?.data ?? []) {
      map.set(question.id, question)
    }
    return map
  }, [questionBankQuery.data?.data])

  const viewerItems = useMemo(() => {
    if (!active?.linkedQuestionIds?.length) return active ? [active] : []
    return active.linkedQuestionIds
      .map((id) => questionBankById.get(id))
      .filter((item): item is NonNullable<typeof item> => Boolean(item))
  }, [active, questionBankById])

  const [viewerId, setViewerId] = useState<string | null>(null)
  const activeViewer = viewerItems.find((r) => r.id === viewerId) ?? viewerItems[0] ?? null
  const courseTitle = enrollment ? enrollmentProductTitle(enrollment) : pageTitle
  const showSubmit =
    category === ResourceCategory.EXAM || category === ResourceCategory.ASSIGNMENT

  useEffect(() => {
    setActiveId(null)
  }, [category, filters.subjectId, filters.moduleId])

  useEffect(() => {
    if (items.length > 0 && !activeId) {
      setActiveId(items[0].id)
    }
  }, [items, activeId])

  useEffect(() => {
    if (viewerItems.length > 0) {
      setViewerId(viewerItems[0].id)
    } else {
      setViewerId(null)
    }
  }, [activeId, viewerItems])

  async function handleSubmit() {
    if (!active || !enrollment) return
    setSubmitError(null)
    try {
      const result = await submitResource({
        enrollmentId,
        resourceId: active.id,
      }).unwrap()
      window.open(result.data.whatsappUrl, "_blank", "noopener,noreferrer")
    } catch (err) {
      setSubmitError(getApiErrorMessage(err, "Could not record submission. Please try again."))
    }
  }

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
        <h1 className="text-2xl font-bold">{pageTitle}</h1>
        {showSubmit && active ? (
          <Button
            className="ml-auto rounded-xl"
            disabled={submitting || activeSubmission?.status === ResourceSubmissionStatus.ACCEPTED}
            onClick={() => void handleSubmit()}
          >
            <Send className="mr-2 h-4 w-4" />
            Submit
          </Button>
        ) : null}
      </div>

      {submitError ? <p className="mb-3 text-sm text-destructive">{submitError}</p> : null}

      <StudentResourceFilters
        enrollment={enrollment}
        values={filters}
        onChange={setFilters}
      />

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
            {items.map((resource) => {
              const submission = submissionByResourceId.get(resource.id)
              return (
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
                    {submission ? (
                      <Badge variant="secondary" className="mt-2">
                        {submissionStatusLabel[submission.status]}
                      </Badge>
                    ) : null}
                  </button>
                </li>
              )
            })}
          </ul>

          <div className="min-h-[70vh]">
            {activeSubmission ? (
              <p className="mb-3 text-sm text-muted-foreground">
                Submission recorded for {user?.name ?? "you"}. Status:{" "}
                {submissionStatusLabel[activeSubmission.status]}.
              </p>
            ) : null}
            {activeViewer ? (
              <div className="space-y-4">
                {viewerItems.length > 1 ? (
                  <div className="flex flex-wrap gap-2">
                    {viewerItems.map((item) => (
                      <Button
                        key={item.id}
                        type="button"
                        size="sm"
                        variant={viewerId === item.id ? "default" : "outline"}
                        className="rounded-xl"
                        onClick={() => setViewerId(item.id)}
                      >
                        {item.title}
                      </Button>
                    ))}
                  </div>
                ) : null}
                <SecurePdfViewer resourceId={activeViewer.id} title={activeViewer.title} />
              </div>
            ) : active?.linkedQuestionIds?.length ? (
              <div className="flex h-full min-h-[50vh] items-center justify-center rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
                Exam questions are not available yet.
              </div>
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
