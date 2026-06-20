"use client"

import { useEffect, useMemo, useState } from "react"
import { Eye, EyeOff, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useListBatchesByCourseQuery, useListBatchesQuery } from "@/features/batch/api"
import { useListCoursesQuery } from "@/features/course/api"
import {
  useDeleteReviewMutation,
  useListAdminReviewsQuery,
  useModerateReviewMutation,
} from "@/features/review/api"
import { ReviewStatus } from "@/types/api"

type ReviewPeriod = "week" | "month" | "all"

function statusLabel(status: ReviewStatus): string {
  switch (status) {
    case ReviewStatus.ACTIVE:
      return "Active"
    case ReviewStatus.HIDDEN:
      return "Hidden"
    default:
      return "Pending"
  }
}

export function AdminReviewsPanel() {
  const [period, setPeriod] = useState<ReviewPeriod>("week")
  const [courseId, setCourseId] = useState("")
  const [batchId, setBatchId] = useState("")
  const [status, setStatus] = useState<ReviewStatus | "ALL">("ALL")
  const [actionError, setActionError] = useState<string | null>(null)

  const { data: coursesData } = useListCoursesQuery({ pageSize: 100 })
  const { data: batchesData } = useListBatchesQuery({ pageSize: 100 })
  const { data: courseBatchesData } = useListBatchesByCourseQuery(courseId, {
    skip: !courseId,
  })

  const queryParams = useMemo(
    () => ({
      period,
      courseId: courseId || undefined,
      batchId: batchId || undefined,
      status: status === "ALL" ? undefined : status,
      pageSize: 50,
    }),
    [period, courseId, batchId, status],
  )

  const { data, isLoading, error } = useListAdminReviewsQuery(queryParams)
  const [moderateReview, { isLoading: moderating }] = useModerateReviewMutation()
  const [deleteReview, { isLoading: deleting }] = useDeleteReviewMutation()

  const reviews = data?.data ?? []
  const batchOptions = courseId
    ? (courseBatchesData?.data ?? [])
    : (batchesData?.data ?? [])

  useEffect(() => {
    setBatchId("")
  }, [courseId])

  async function handleActivate(id: string) {
    setActionError(null)
    try {
      await moderateReview({ id, body: { action: "activate" } }).unwrap()
    } catch {
      setActionError("Could not activate review.")
    }
  }

  async function handleHide(id: string) {
    setActionError(null)
    try {
      await moderateReview({ id, body: { action: "hide" } }).unwrap()
    } catch {
      setActionError("Could not hide review.")
    }
  }

  async function handleDelete(id: string) {
    setActionError(null)
    try {
      await deleteReview(id).unwrap()
    } catch {
      setActionError("Could not delete review.")
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 rounded-xl border bg-card p-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground">Time</p>
          <Select value={period} onValueChange={(value) => setPeriod(value as ReviewPeriod)}>
            <SelectTrigger className="rounded-lg">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This week</SelectItem>
              <SelectItem value="month">This month</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground">Course</p>
          <Select
            value={courseId || "ALL"}
            onValueChange={(value) => setCourseId(value === "ALL" ? "" : value)}
          >
            <SelectTrigger className="rounded-lg">
              <SelectValue placeholder="All courses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All courses</SelectItem>
              {(coursesData?.data ?? []).map((course) => (
                <SelectItem key={course.id} value={course.id}>
                  {course.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground">Batch</p>
          <Select
            value={batchId || "ALL"}
            onValueChange={(value) => setBatchId(value === "ALL" ? "" : value)}
          >
            <SelectTrigger className="rounded-lg">
              <SelectValue placeholder="All batches" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All batches</SelectItem>
              {batchOptions.map((batch) => (
                <SelectItem key={batch.id} value={batch.id}>
                  {batch.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground">Status</p>
          <Select
            value={status}
            onValueChange={(value) => setStatus(value as ReviewStatus | "ALL")}
          >
            <SelectTrigger className="rounded-lg">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All statuses</SelectItem>
              <SelectItem value={ReviewStatus.PENDING}>Pending</SelectItem>
              <SelectItem value={ReviewStatus.ACTIVE}>Active</SelectItem>
              <SelectItem value={ReviewStatus.HIDDEN}>Hidden</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {actionError ? <p className="text-sm text-destructive">{actionError}</p> : null}

      {isLoading ? (
        <p className="text-muted-foreground">Loading reviews…</p>
      ) : error ? (
        <p className="text-destructive">Could not load reviews.</p>
      ) : reviews.length === 0 ? (
        <div className="rounded-xl border border-dashed p-10 text-center text-muted-foreground">
          No reviews match these filters.
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="rounded-xl border bg-card p-5">
              <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">{statusLabel(review.status)}</Badge>
                    <Badge>{review.courseTitle}</Badge>
                    {review.batchTitle ? <Badge variant="outline">{review.batchTitle}</Badge> : null}
                  </div>
                  <h3 className="text-lg font-semibold">{review.studentName}</h3>
                  <p className="text-sm text-muted-foreground">{review.studentPhone}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Submitted {new Date(review.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              <p className="mb-4 text-sm leading-relaxed text-foreground">{review.text}</p>

              <div className="flex flex-wrap gap-2">
                {review.status !== ReviewStatus.ACTIVE ? (
                  <Button
                    size="sm"
                    className="rounded-lg bg-secondary text-primary hover:bg-secondary/90"
                    disabled={moderating || deleting}
                    onClick={() => handleActivate(review.id)}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Show
                  </Button>
                ) : null}
                {review.status !== ReviewStatus.HIDDEN ? (
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-lg"
                    disabled={moderating || deleting}
                    onClick={() => handleHide(review.id)}
                  >
                    <EyeOff className="mr-2 h-4 w-4" />
                    Hide
                  </Button>
                ) : null}
                <Button
                  size="sm"
                  variant="destructive"
                  className="rounded-lg"
                  disabled={moderating || deleting}
                  onClick={() => handleDelete(review.id)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
