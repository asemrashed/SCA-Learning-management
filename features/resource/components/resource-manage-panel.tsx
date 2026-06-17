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
import { useGetBatchQuery } from "@/features/batch/api"
import { useTeachingProducts } from "@/features/assessment/hooks/use-teaching-products"
import { getApiErrorMessage } from "@/lib/get-api-error-message"
import {
  ASSESSMENT_RESOURCE_CATEGORIES,
  RESOURCE_CATEGORY_LABELS,
} from "@/lib/resource-categories"
import type { ResourceItem } from "@/types/api"
import { ResourceCategory } from "@/types/api"

type ResourceRow = { resource: ResourceItem; productLabel: string }

function useResourceRows(
  courses: { id: string; title: string }[],
  refreshKey: number,
  categoryFilter?: ResourceCategory,
) {
  const [fetchResources] = useLazyListResourcesQuery()
  const [loading, setLoading] = useState(true)
  const [rows, setRows] = useState<ResourceRow[]>([])

  const scopeKey = useMemo(
    () => `${refreshKey}:${categoryFilter ?? "all"}:${courses.map((c) => c.id).join(",")}`,
    [refreshKey, categoryFilter, courses],
  )

  useEffect(() => {
    let cancelled = false
    setLoading(true)

    async function load() {
      const next: ResourceRow[] = []
      for (const course of courses) {
        const result = await fetchResources({
          courseId: course.id,
          pageSize: 100,
          ...(categoryFilter ? { category: categoryFilter } : {}),
        })
        if (result.data?.data) {
          for (const resource of result.data.data) {
            if (
              !categoryFilter &&
              ASSESSMENT_RESOURCE_CATEGORIES.has(resource.category)
            ) {
              continue
            }
            next.push({ resource, productLabel: course.title })
          }
        }
      }
      if (!cancelled) {
        setRows(next)
        setLoading(false)
      }
    }

    if (courses.length === 0) {
      setRows([])
      setLoading(false)
      return
    }

    void load()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scopeKey])

  return { loading, rows }
}

export function ResourceManagePanel({
  fixedBatchId,
  fixedCourseId,
  defaultCategory,
  title = "Resources",
  description = "Manage course PDFs and materials.",
}: {
  fixedBatchId?: string
  fixedCourseId?: string
  defaultCategory?: ResourceCategory
  title?: string
  description?: string
} = {}) {
  const [addOpen, setAddOpen] = useState(false)
  const [editResource, setEditResource] = useState<ResourceItem | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const { batches, courses, isLoading: productsLoading } = useTeachingProducts()
  const { data: fixedBatch } = useGetBatchQuery(fixedBatchId ?? "", { skip: !fixedBatchId })
  const [deleteResource, { isLoading: deleting }] = useDeleteResourceMutation()

  const scopeCourses = useMemo(() => {
    if (fixedCourseId) {
      return courses.filter((c) => c.id === fixedCourseId)
    }
    if (fixedBatchId && fixedBatch?.data) {
      const parent = courses.find((c) => c.id === fixedBatch.data.courseId)
      return parent ? [parent] : []
    }
    const byId = new Map(courses.map((c) => [c.id, c]))
    for (const batch of batches) {
      const match = courses.find((c) => c.id === batch.courseId)
      if (match) byId.set(match.id, match)
    }
    return Array.from(byId.values())
  }, [fixedCourseId, fixedBatchId, fixedBatch, courses, batches])

  const { loading: listLoading, rows } = useResourceRows(
    scopeCourses,
    refreshKey,
    defaultCategory,
  )

  const hasProducts = scopeCourses.length > 0
  const showLoading = productsLoading || listLoading

  const categoryLabel = defaultCategory
    ? RESOURCE_CATEGORY_LABELS[defaultCategory]
    : "Resource"
  const categoryLabelLower = categoryLabel.toLowerCase()

  async function handleDelete(resource: ResourceItem) {
    if (!window.confirm(`Delete "${resource.title}"? This cannot be undone.`)) return
    setDeleteError(null)
    try {
      await deleteResource(resource.id).unwrap()
      setRefreshKey((k) => k + 1)
    } catch (err) {
      setDeleteError(getApiErrorMessage(err, "Could not delete resource."))
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-medium">{title}</p>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <Button className="rounded-xl" onClick={() => setAddOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add new
        </Button>
      </div>

      {deleteError ? <p className="text-sm text-destructive">{deleteError}</p> : null}

      <div className="overflow-hidden rounded-xl border bg-card">
        {showLoading ? (
          <p className="px-5 py-8 text-sm text-muted-foreground">Loading resources…</p>
        ) : !hasProducts ? (
          <p className="px-5 py-8 text-center text-sm text-muted-foreground">
            No course available yet.
          </p>
        ) : rows.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-muted-foreground">
            No resource is added yet.
          </p>
        ) : (
          <ul>
            {rows.map(({ resource, productLabel }) => (
              <li
                key={resource.id}
                className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4 last:border-b-0"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{resource.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {productLabel} · {RESOURCE_CATEGORY_LABELS[resource.category]} · Added{" "}
                    {new Date(resource.createdAt).toLocaleDateString()}
                  </p>
                </div>
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
              </li>
            ))}
          </ul>
        )}
      </div>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add {categoryLabelLower}</DialogTitle>
            <DialogDescription>
              Upload a PDF and link it to a course{defaultCategory ? "" : " or batch"}.
            </DialogDescription>
          </DialogHeader>
          <ResourceForm
            fixedBatchId={fixedBatchId}
            fixedCourseId={fixedCourseId}
            defaultCategory={defaultCategory}
            lockCategory={Boolean(defaultCategory)}
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
            <DialogTitle>Edit {categoryLabelLower}</DialogTitle>
            <DialogDescription>Update title, PDF, or placement.</DialogDescription>
          </DialogHeader>
          {editResource ? (
            <ResourceForm
              resource={editResource}
              fixedCourseId={editResource.courseId ?? fixedCourseId}
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
