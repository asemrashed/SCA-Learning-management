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
import {
  useLazyListBatchAssignmentsQuery,
  useLazyListCourseAssignmentsQuery,
} from "@/features/assessment/api"
import { AssignmentCreateForm } from "@/features/assessment/components/assessment-admin-forms"
import { useTeachingProducts } from "@/features/assessment/hooks/use-teaching-products"
import type { AssignmentListItem } from "@/types/api"

type AssignmentRow = { assignment: AssignmentListItem; productLabel: string }

function useAssignmentRows(
  batches: { id: string; title: string }[],
  courses: { id: string; title: string }[],
  refreshKey: number,
) {
  const [fetchBatch] = useLazyListBatchAssignmentsQuery()
  const [fetchCourse] = useLazyListCourseAssignmentsQuery()
  const [loading, setLoading] = useState(true)
  const [rows, setRows] = useState<AssignmentRow[]>([])

  const scopeKey = useMemo(
    () =>
      `${refreshKey}:${batches.map((b) => b.id).join(",")}:${courses.map((c) => c.id).join(",")}`,
    [refreshKey, batches, courses],
  )

  useEffect(() => {
    let cancelled = false
    setLoading(true)

    async function load() {
      const next: AssignmentRow[] = []
      for (const batch of batches) {
        const result = await fetchBatch(batch.id)
        if (result.data?.data) {
          for (const assignment of result.data.data) {
            next.push({ assignment, productLabel: batch.title })
          }
        }
      }
      for (const course of courses) {
        const result = await fetchCourse(course.id)
        if (result.data?.data) {
          for (const assignment of result.data.data) {
            next.push({ assignment, productLabel: course.title })
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

export function AssignmentManagePanel({
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
  const { loading: listLoading, rows } = useAssignmentRows(scopeBatches, scopeCourses, refreshKey)

  const hasProducts = scopeBatches.length > 0 || scopeCourses.length > 0
  const showLoading = productsLoading || listLoading

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {fixedBatchId || fixedCourseId
            ? "Assignments for this product"
            : "All assignments across your batches and courses"}
        </p>
        <Button className="rounded-xl" onClick={() => setOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add new
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border bg-card">
        {showLoading ? (
          <p className="px-5 py-8 text-sm text-muted-foreground">Loading assignments…</p>
        ) : !hasProducts ? (
          <p className="px-5 py-8 text-center text-sm text-muted-foreground">
            No batch or course available yet.
          </p>
        ) : rows.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-muted-foreground">
            No assignment is added yet.
          </p>
        ) : (
          <ul>
            {rows.map(({ assignment, productLabel }) => (
              <li
                key={assignment.id}
                className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4 last:border-b-0"
              >
                <div>
                  <p className="font-medium">{assignment.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {productLabel} · {assignment.totalMarks} marks
                    {assignment.dueAt
                      ? ` · Due ${new Date(assignment.dueAt).toLocaleDateString()}`
                      : ""}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create assignment</DialogTitle>
            <DialogDescription>
              Attach homework to a batch or course for your students.
            </DialogDescription>
          </DialogHeader>
          <AssignmentCreateForm
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
