"use client"

import { useEffect, useMemo, useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useLazyListResourcesQuery } from "@/features/resource/api"
import { ResourceUploadForm } from "@/features/resource/components/resource-upload-form"
import { useTeachingProducts } from "@/features/assessment/hooks/use-teaching-products"
import type { ResourceItem } from "@/types/api"

type ResourceRow = { resource: ResourceItem; productLabel: string }

function useResourceRows(
  batches: { id: string; title: string }[],
  courses: { id: string; title: string }[],
  refreshKey: number,
) {
  const [fetchResources] = useLazyListResourcesQuery()
  const [loading, setLoading] = useState(true)
  const [rows, setRows] = useState<ResourceRow[]>([])

  const scopeKey = useMemo(
    () =>
      `${refreshKey}:${batches.map((b) => b.id).join(",")}:${courses.map((c) => c.id).join(",")}`,
    [refreshKey, batches, courses],
  )

  useEffect(() => {
    let cancelled = false
    setLoading(true)

    async function load() {
      const next: ResourceRow[] = []
      for (const batch of batches) {
        const result = await fetchResources({ batchId: batch.id, pageSize: 100 })
        if (result.data?.data) {
          for (const resource of result.data.data) {
            next.push({ resource, productLabel: batch.title })
          }
        }
      }
      for (const course of courses) {
        const result = await fetchResources({ courseId: course.id, pageSize: 100 })
        if (result.data?.data) {
          for (const resource of result.data.data) {
            next.push({ resource, productLabel: course.title })
          }
        }
      }
      if (!cancelled) {
        setRows(next)
        setLoading(false)
      }
    }

    if (batches.length === 0 && courses.length === 0) {
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
}: {
  fixedBatchId?: string
  fixedCourseId?: string
} = {}) {
  const [open, setOpen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const { batches, courses, isLoading: productsLoading } = useTeachingProducts()

  const scopeBatches = fixedBatchId ? batches.filter((b) => b.id === fixedBatchId) : batches
  const scopeCourses = fixedCourseId ? courses.filter((c) => c.id === fixedCourseId) : courses
  const { loading: listLoading, rows } = useResourceRows(scopeBatches, scopeCourses, refreshKey)

  const hasProducts = scopeBatches.length > 0 || scopeCourses.length > 0
  const showLoading = productsLoading || listLoading

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {fixedBatchId || fixedCourseId
            ? "Resources for this product"
            : "All resources across your batches and courses"}
        </p>
        <Button className="rounded-xl" onClick={() => setOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add new
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border bg-card">
        {showLoading ? (
          <p className="px-5 py-8 text-sm text-muted-foreground">Loading resources…</p>
        ) : !hasProducts ? (
          <p className="px-5 py-8 text-center text-sm text-muted-foreground">
            No batch or course available yet.
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
                <div>
                  <p className="font-medium">{resource.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {productLabel} · {resource.fileType ?? "file"} · Added{" "}
                    {new Date(resource.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <Button variant="outline" size="sm" className="rounded-xl" asChild>
                  <a href={resource.fileUrl} target="_blank" rel="noopener noreferrer">
                    Open
                  </a>
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add resource</DialogTitle>
            <DialogDescription>
              Link PDF notes, past papers, or other files to a batch or course.
            </DialogDescription>
          </DialogHeader>
          <ResourceUploadForm
            fixedBatchId={fixedBatchId}
            fixedCourseId={fixedCourseId}
            inModal
            onSuccess={() => {
              setOpen(false)
              setRefreshKey((k) => k + 1)
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
