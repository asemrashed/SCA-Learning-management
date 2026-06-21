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
import {
  AssessmentListFilters,
  type AssessmentListFilterValues,
} from "@/features/resource/components/assessment-list-filters"
import { ResourceForm } from "@/features/resource/components/resource-upload-form"
import { ResourceViewButton } from "@/features/resource/components/resource-view-button"
import { useGetBatchQuery } from "@/features/batch/api"
import { useTeachingProducts } from "@/features/resource/hooks/use-teaching-products"
import { getApiErrorMessage } from "@/lib/get-api-error-message"
import type { ResourceItem } from "@/types/api"
import { ResourceCategory } from "@/types/api"

type AssignmentRow = {
  resource: ResourceItem
  courseTitle: string
  batchTitle: string
}

const emptyFilters: AssessmentListFilterValues = {
  courseId: "",
  batchId: "",
  subjectId: "",
  search: "",
}

function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "—"
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  })
}

export function AssignmentManagePanel({
  fixedBatchId,
  fixedCourseId,
}: {
  fixedBatchId?: string
  fixedCourseId?: string
} = {}) {
  const [filters, setFilters] = useState<AssessmentListFilterValues>(emptyFilters)
  const [addOpen, setAddOpen] = useState(false)
  const [editResource, setEditResource] = useState<ResourceItem | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [rows, setRows] = useState<AssignmentRow[]>([])
  const { batches, courses, isLoading: productsLoading } = useTeachingProducts()
  const { data: fixedBatch } = useGetBatchQuery(fixedBatchId ?? "", { skip: !fixedBatchId })
  const [fetchResources] = useLazyListResourcesQuery()
  const [deleteResource, { isLoading: deleting }] = useDeleteResourceMutation()

  const scopeCourses = useMemo(() => {
    if (fixedCourseId) {
      return courses.filter((c) => c.id === fixedCourseId)
    }
    if (fixedBatchId && fixedBatch?.data) {
      const parent = courses.find((c) => c.id === fixedBatch.data.courseId)
      return parent ? [parent] : []
    }
    if (filters.courseId) {
      return courses.filter((c) => c.id === filters.courseId)
    }
    const byId = new Map(courses.map((c) => [c.id, c]))
    for (const batch of batches) {
      const match = courses.find((c) => c.id === batch.courseId)
      if (match) byId.set(match.id, match)
    }
    return Array.from(byId.values())
  }, [fixedCourseId, fixedBatchId, fixedBatch, courses, batches, filters.courseId])

  const filterKey = useMemo(
    () =>
      [
        refreshKey,
        filters.courseId,
        filters.batchId,
        filters.subjectId,
        filters.search,
        scopeCourses.map((c) => c.id).join(","),
      ].join(":"),
    [refreshKey, filters, scopeCourses],
  )

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setLoadError(null)

    async function load() {
      const next: AssignmentRow[] = []
      for (const course of scopeCourses) {
        const result = await fetchResources({
          courseId: course.id,
          pageSize: 100,
          category: ResourceCategory.ASSIGNMENT,
          ...(filters.batchId ? { batchId: filters.batchId } : {}),
          ...(filters.subjectId ? { subjectId: filters.subjectId } : {}),
        })
        if (result.error) {
          setLoadError(getApiErrorMessage(result.error, "Could not load assignments."))
          continue
        }
        for (const resource of result.data?.data ?? []) {
          if (filters.search.trim()) {
            const term = filters.search.trim().toLowerCase()
            if (!resource.title.toLowerCase().includes(term)) continue
          }
          next.push({
            resource,
            courseTitle: course.title,
            batchTitle: resource.batchId
              ? (batches.find((b) => b.id === resource.batchId)?.title ?? "—")
              : "—",
          })
        }
      }
      next.sort(
        (a, b) =>
          new Date(b.resource.createdAt).getTime() - new Date(a.resource.createdAt).getTime(),
      )
      if (!cancelled) {
        setRows(next)
        setLoading(false)
      }
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
  }, [filterKey])

  async function handleDelete(resource: ResourceItem) {
    if (!window.confirm(`Delete "${resource.title}"? This cannot be undone.`)) return
    setDeleteError(null)
    try {
      await deleteResource(resource.id).unwrap()
      setRefreshKey((k) => k + 1)
    } catch (err) {
      setDeleteError(getApiErrorMessage(err, "Could not delete assignment."))
    }
  }

  const showLoading = productsLoading || loading

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-medium">All assignments</p>
          <p className="text-sm text-muted-foreground">
            Upload assignment PDFs linked to courses and batches.
          </p>
        </div>
        <Button className="rounded-xl" onClick={() => setAddOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add assignment
        </Button>
      </div>

      <div className="rounded-xl border bg-card p-4">
        <AssessmentListFilters values={filters} onChange={setFilters} />
      </div>

      {deleteError ? <p className="text-sm text-destructive">{deleteError}</p> : null}
      {loadError ? <p className="text-sm text-destructive">{loadError}</p> : null}

      <div className="overflow-hidden rounded-xl border bg-card">
        {showLoading ? (
          <p className="px-5 py-8 text-sm text-muted-foreground">Loading assignments…</p>
        ) : rows.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-muted-foreground">
            No assignments match these filters.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Title</th>
                  <th className="px-4 py-3 font-medium">Course</th>
                  <th className="px-4 py-3 font-medium">Batch</th>
                  <th className="px-4 py-3 font-medium">Start</th>
                  <th className="px-4 py-3 font-medium">Deadline</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(({ resource, courseTitle, batchTitle }) => (
                  <tr key={resource.id} className="border-b last:border-b-0">
                    <td className="px-4 py-3 font-medium">{resource.title}</td>
                    <td className="px-4 py-3 text-muted-foreground">{courseTitle}</td>
                    <td className="px-4 py-3 text-muted-foreground">{batchTitle}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatDateTime(resource.startsAt)}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatDateTime(resource.deadlineAt)}
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
            <DialogTitle>Add assignment</DialogTitle>
            <DialogDescription>
              Upload an assignment PDF with start time and deadline.
            </DialogDescription>
          </DialogHeader>
          <ResourceForm
            fixedBatchId={fixedBatchId}
            fixedCourseId={fixedCourseId}
            defaultCategory={ResourceCategory.ASSIGNMENT}
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
            <DialogTitle>Edit assignment</DialogTitle>
            <DialogDescription>Update title, PDF, timing, or placement.</DialogDescription>
          </DialogHeader>
          {editResource ? (
            <ResourceForm
              resource={editResource}
              fixedCourseId={editResource.courseId ?? fixedCourseId}
              defaultCategory={ResourceCategory.ASSIGNMENT}
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
