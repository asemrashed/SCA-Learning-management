"use client"

import { useEffect, useMemo, useState } from "react"
import { Pencil, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  useDeleteResourceMutation,
  useLazyListResourcesQuery,
} from "@/features/resource/api"
import { ResourceForm } from "@/features/resource/components/resource-upload-form"
import { ResourceViewButton } from "@/features/resource/components/resource-view-button"
import {
  QuestionBankFilters,
  type QuestionBankFilterValues,
} from "@/features/resource/components/question-bank-filters"
import { useLazyGetBatchCurriculumQuery, useListBatchesQuery } from "@/features/batch/api"
import { useListCoursesQuery } from "@/features/course/api"
import { getApiErrorMessage } from "@/lib/get-api-error-message"
import type { ResourceItem } from "@/types/api"
import { ResourceCategory } from "@/types/api"

type QuestionRow = {
  resource: ResourceItem
  courseTitle: string
  batchTitle: string
  subjectTitle: string
}

const emptyFilters: QuestionBankFilterValues = {
  courseId: "",
  batchId: "",
  subjectId: "",
}

export function QuestionBankPanel() {
  const [filters, setFilters] = useState<QuestionBankFilterValues>(emptyFilters)
  const [addOpen, setAddOpen] = useState(false)
  const [editResource, setEditResource] = useState<ResourceItem | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [rows, setRows] = useState<QuestionRow[]>([])
  const { data: coursesData, isLoading: coursesLoading } = useListCoursesQuery({ pageSize: 100 })
  const { data: batchesData } = useListBatchesQuery({ pageSize: 100 })
  const [fetchResources] = useLazyListResourcesQuery()
  const [fetchCurriculum] = useLazyGetBatchCurriculumQuery()
  const [deleteResource, { isLoading: deleting }] = useDeleteResourceMutation()

  const courses = coursesData?.data ?? []
  const batches = batchesData?.data ?? []

  const scopeCourses = useMemo(() => {
    if (filters.courseId) {
      return courses.filter((c) => c.id === filters.courseId)
    }
    return courses
  }, [courses, filters.courseId])

  const filterKey = useMemo(
    () =>
      [
        refreshKey,
        filters.courseId,
        filters.batchId,
        filters.subjectId,
        scopeCourses.map((c) => c.id).join(","),
      ].join(":"),
    [refreshKey, filters, scopeCourses],
  )

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setLoadError(null)

    async function load() {
      const next: QuestionRow[] = []
      const batchIdsForSubjects = new Set<string>()

      try {
        for (const course of scopeCourses) {
          const result = await fetchResources({
            courseId: course.id,
            pageSize: 100,
            category: ResourceCategory.QUESTION_BANK,
            ...(filters.batchId ? { batchId: filters.batchId } : {}),
            ...(filters.subjectId ? { subjectId: filters.subjectId } : {}),
          })

          if (result.error) {
            if (!cancelled) {
              setLoadError(getApiErrorMessage(result.error, "Could not load questions."))
            }
            continue
          }

          for (const resource of result.data?.data ?? []) {
            if (resource.batchId && resource.subjectId) {
              batchIdsForSubjects.add(resource.batchId)
            }
            next.push({
              resource,
              courseTitle: course.title,
              batchTitle: resource.batchId
                ? (batches.find((b) => b.id === resource.batchId)?.title ?? "—")
                : "—",
              subjectTitle: "—",
            })
          }
        }

        const subjectTitleByBatch = new Map<string, Map<string, string>>()
        await Promise.all(
          [...batchIdsForSubjects].map(async (batchId) => {
            try {
              const curriculum = await fetchCurriculum(batchId).unwrap()
              const bySubject = new Map(
                curriculum.data.map((subject) => [subject.id, subject.title]),
              )
              subjectTitleByBatch.set(batchId, bySubject)
            } catch {
              subjectTitleByBatch.set(batchId, new Map())
            }
          }),
        )

        for (const row of next) {
          const { resource } = row
          if (resource.batchId && resource.subjectId) {
            row.subjectTitle =
              subjectTitleByBatch.get(resource.batchId)?.get(resource.subjectId) ?? "—"
          }
        }

        next.sort(
          (a, b) =>
            new Date(b.resource.createdAt).getTime() - new Date(a.resource.createdAt).getTime(),
        )

        if (!cancelled) {
          setRows(next)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    if (coursesLoading) {
      return
    }

    if (scopeCourses.length === 0) {
      setRows([])
      setLoading(false)
      return
    }

    void load()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterKey, coursesLoading])

  async function handleDelete(resource: ResourceItem) {
    if (!window.confirm(`Delete "${resource.title}"? This cannot be undone.`)) return
    setDeleteError(null)
    try {
      await deleteResource(resource.id).unwrap()
      setRefreshKey((k) => k + 1)
    } catch (err) {
      setDeleteError(getApiErrorMessage(err, "Could not delete question."))
    }
  }

  const showLoading = coursesLoading || loading

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-medium">Question bank</p>
          <p className="text-sm text-muted-foreground">
            Upload PDF questions with marks. Use them when building exams.
          </p>
        </div>
        <Button className="rounded-xl" onClick={() => setAddOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add question
        </Button>
      </div>

      <div className="rounded-xl border bg-card p-4">
        <QuestionBankFilters values={filters} onChange={setFilters} layout="row" />
      </div>

      {deleteError ? <p className="text-sm text-destructive">{deleteError}</p> : null}
      {loadError ? <p className="text-sm text-destructive">{loadError}</p> : null}

      <div className="overflow-hidden rounded-xl border bg-card">
        {showLoading ? (
          <p className="px-5 py-8 text-sm text-muted-foreground">Loading questions…</p>
        ) : rows.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-muted-foreground">
            No questions match these filters. Add a question PDF to get started.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Title</th>
                  <th className="px-4 py-3 font-medium">Course</th>
                  <th className="px-4 py-3 font-medium">Batch</th>
                  <th className="px-4 py-3 font-medium">Subject</th>
                  <th className="px-4 py-3 font-medium">Marks</th>
                  <th className="px-4 py-3 font-medium">Added</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(({ resource, courseTitle, batchTitle, subjectTitle }) => (
                  <tr key={resource.id} className="border-b last:border-b-0">
                    <td className="px-4 py-3 font-medium">{resource.title}</td>
                    <td className="px-4 py-3 text-muted-foreground">{courseTitle}</td>
                    <td className="px-4 py-3 text-muted-foreground">{batchTitle}</td>
                    <td className="px-4 py-3 text-muted-foreground">{subjectTitle}</td>
                    <td className="px-4 py-3">{resource.marks ?? "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(resource.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex shrink-0 gap-2">
                        <ResourceViewButton resource={resource} className="rounded-xl" />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="rounded-xl"
                          onClick={() => setEditResource(resource)}
                          aria-label="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="rounded-xl text-destructive hover:text-destructive"
                          disabled={deleting}
                          onClick={() => void handleDelete(resource)}
                          aria-label="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add question</DialogTitle>
            <DialogDescription>
              Upload a PDF question. It will appear in the question bank for exam building.
            </DialogDescription>
          </DialogHeader>
          <ResourceForm
            defaultCategory={ResourceCategory.QUESTION_BANK}
            lockCategory
            inModal
            onSuccess={() => {
              setAddOpen(false)
              setRefreshKey((k) => k + 1)
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(editResource)} onOpenChange={(open) => !open && setEditResource(null)}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit question</DialogTitle>
            <DialogDescription>Update title, PDF, marks, or placement.</DialogDescription>
          </DialogHeader>
          {editResource ? (
            <ResourceForm
              resource={editResource}
              fixedCourseId={editResource.courseId ?? undefined}
              defaultCategory={ResourceCategory.QUESTION_BANK}
              lockCategory
              inModal
              onSuccess={() => {
                setEditResource(null)
                setRefreshKey((k) => k + 1)
              }}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  )
}
