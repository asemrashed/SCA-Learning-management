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
  useLazyListBatchExamsQuery,
  useLazyListCourseExamsQuery,
} from "@/features/assessment/api"
import { ExamCreateForm } from "@/features/assessment/components/assessment-admin-forms"
import { useTeachingProducts } from "@/features/assessment/hooks/use-teaching-products"
import type { ExamListItem } from "@/types/api"

type ExamRow = { exam: ExamListItem; productLabel: string }

function useExamRows(
  batches: { id: string; title: string }[],
  courses: { id: string; title: string }[],
  refreshKey: number,
) {
  const [fetchBatchExams] = useLazyListBatchExamsQuery()
  const [fetchCourseExams] = useLazyListCourseExamsQuery()
  const [loading, setLoading] = useState(true)
  const [rows, setRows] = useState<ExamRow[]>([])

  const scopeKey = useMemo(
    () =>
      `${refreshKey}:${batches.map((b) => b.id).join(",")}:${courses.map((c) => c.id).join(",")}`,
    [refreshKey, batches, courses],
  )

  useEffect(() => {
    let cancelled = false
    setLoading(true)

    async function load() {
      const next: ExamRow[] = []
      for (const batch of batches) {
        const result = await fetchBatchExams(batch.id)
        if (result.data?.data) {
          for (const exam of result.data.data) {
            next.push({ exam, productLabel: batch.title })
          }
        }
      }
      for (const course of courses) {
        const result = await fetchCourseExams(course.id)
        if (result.data?.data) {
          for (const exam of result.data.data) {
            next.push({ exam, productLabel: course.title })
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
    // fetchBatchExams / fetchCourseExams are stable enough; scopeKey drives reloads
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scopeKey])

  return { loading, rows }
}

export function ExamManagePanel({
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
  const { loading: listLoading, rows } = useExamRows(scopeBatches, scopeCourses, refreshKey)

  const hasProducts = scopeBatches.length > 0 || scopeCourses.length > 0
  const showLoading = productsLoading || listLoading

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {fixedBatchId || fixedCourseId
            ? "Exams for this product"
            : "All exams across your batches and courses"}
        </p>
        <Button className="rounded-xl" onClick={() => setOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add new
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border bg-card">
        {showLoading ? (
          <p className="px-5 py-8 text-sm text-muted-foreground">Loading exams…</p>
        ) : !hasProducts ? (
          <p className="px-5 py-8 text-center text-sm text-muted-foreground">
            No batch or course available yet.
          </p>
        ) : rows.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-muted-foreground">
            No exam is added yet.
          </p>
        ) : (
          <ul>
            {rows.map(({ exam, productLabel }) => (
              <li
                key={exam.id}
                className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4 last:border-b-0"
              >
                <div>
                  <p className="font-medium">{exam.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {productLabel} · {exam.questionCount} questions · {exam.totalMarks} marks ·{" "}
                    {exam.status}
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
            <DialogTitle>Create exam</DialogTitle>
            <DialogDescription>
              Add questions and attach the exam to a batch or course.
            </DialogDescription>
          </DialogHeader>
          <ExamCreateForm
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
