"use client"

import { useEffect, useMemo, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DashboardTable } from "@/components/dashboard-table"
import { TableRowActions } from "@/components/table-row-actions"
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
  useListAdminResourceSubmissionsQuery,
  useReviewResourceSubmissionMutation,
} from "@/features/resource-submission/api"
import { getApiErrorMessage } from "@/lib/get-api-error-message"
import { DeliveryMode, ResourceCategory, ResourceSubmissionStatus } from "@/types/api"

const statusLabel: Record<ResourceSubmissionStatus, string> = {
  [ResourceSubmissionStatus.PENDING]: "Pending",
  [ResourceSubmissionStatus.ACCEPTED]: "Accepted",
  [ResourceSubmissionStatus.REJECTED]: "Rejected",
}

const statusVariant: Record<
  ResourceSubmissionStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  [ResourceSubmissionStatus.PENDING]: "secondary",
  [ResourceSubmissionStatus.ACCEPTED]: "default",
  [ResourceSubmissionStatus.REJECTED]: "destructive",
}

interface SubmissionsPanelProps {
  category: ResourceCategory.EXAM | ResourceCategory.ASSIGNMENT
  title: string
}

export function SubmissionsPanel({ category, title }: SubmissionsPanelProps) {
  const [status, setStatus] = useState<ResourceSubmissionStatus | "ALL">(
    ResourceSubmissionStatus.PENDING,
  )
  const [courseId, setCourseId] = useState("")
  const [batchId, setBatchId] = useState("")
  const [search, setSearch] = useState("")
  const [actionError, setActionError] = useState<string | null>(null)

  const { data: coursesData } = useListCoursesQuery({ deliveryMode: DeliveryMode.LIVE, pageSize: 100 })
  const { data: batchesData } = useListBatchesQuery({ pageSize: 100 })
  const { data: courseBatchesData } = useListBatchesByCourseQuery(courseId, { skip: !courseId })

  const queryParams = useMemo(
    () => ({
      category,
      courseId: courseId || undefined,
      batchId: batchId || undefined,
      search: search.trim() || undefined,
      status: status === "ALL" ? undefined : status,
      pageSize: 50,
    }),
    [category, courseId, batchId, search, status],
  )

  const { data, isLoading, error } = useListAdminResourceSubmissionsQuery(queryParams)
  const [reviewSubmission, { isLoading: reviewing }] = useReviewResourceSubmissionMutation()

  const submissions = data?.data ?? []
  const batchOptions = courseId
    ? (courseBatchesData?.data ?? [])
    : (batchesData?.data ?? [])

  useEffect(() => {
    setBatchId("")
  }, [courseId])

  async function handleReview(id: string, action: "accept" | "reject") {
    setActionError(null)
    try {
      await reviewSubmission({ id, body: { action } }).unwrap()
    } catch (err) {
      setActionError(getApiErrorMessage(err, "Could not update submission."))
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <Select
          value={status}
          onValueChange={(v) => setStatus(v as ResourceSubmissionStatus | "ALL")}
        >
          <SelectTrigger className="w-full lg:w-[200px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All statuses</SelectItem>
            {Object.values(ResourceSubmissionStatus).map((value) => (
              <SelectItem key={value} value={value}>
                {statusLabel[value]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex w-full flex-col gap-3 sm:flex-row lg:max-w-3xl lg:flex-1 lg:justify-end">
        <Select value={courseId || "__all__"} onValueChange={(v) => setCourseId(v === "__all__" ? "" : v)}>
          <SelectTrigger className="w-full sm:flex-1">
            <SelectValue placeholder="Course" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All courses</SelectItem>
            {(coursesData?.data ?? []).map((course) => (
              <SelectItem key={course.id} value={course.id}>
                {course.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={batchId || "__all__"} onValueChange={(v) => setBatchId(v === "__all__" ? "" : v)}>
          <SelectTrigger className="w-full sm:flex-1">
            <SelectValue placeholder="Batch" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All batches</SelectItem>
            {batchOptions.map((batch) => (
              <SelectItem key={batch.id} value={batch.id}>
                {batch.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          className="w-full sm:flex-1"
          placeholder="Search student or title…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        </div>
      </div>

      {actionError ? <p className="text-sm text-destructive">{actionError}</p> : null}

      <DashboardTable className="bg-card">
        {isLoading ? (
          <p className="px-5 py-8 text-sm text-muted-foreground">Loading submissions…</p>
        ) : error ? (
          <p className="px-5 py-8 text-sm text-destructive">Could not load submissions.</p>
        ) : submissions.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-muted-foreground">
            No submissions match these filters.
          </p>
        ) : (
          <div className="overflow-x-auto scrollbar-slim">
            <table className="w-full min-w-[800px] text-sm">
              <thead>
                <tr className="border-b bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Student</th>
                  <th className="px-4 py-3 font-medium">{title}</th>
                  <th className="px-4 py-3 font-medium">Subject</th>
                  <th className="px-4 py-3 font-medium">Submitted</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((item) => (
                  <tr key={item.id} className="border-b last:border-b-0">
                    <td className="px-4 py-3">
                      <p className="font-medium">{item.student.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.student.rollNumber ?? item.student.phone}
                      </p>
                    </td>
                    <td className="px-4 py-3">{item.resource.title}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {item.resource.subjectTitle ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(item.submittedAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={statusVariant[item.status]}>{statusLabel[item.status]}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <TableRowActions
                        actions={
                          item.status === ResourceSubmissionStatus.PENDING
                            ? [
                                {
                                  label: "Accept",
                                  disabled: reviewing,
                                  onClick: () => void handleReview(item.id, "accept"),
                                },
                                {
                                  label: "Reject",
                                  destructive: true,
                                  disabled: reviewing,
                                  onClick: () => void handleReview(item.id, "reject"),
                                },
                              ]
                            : []
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </DashboardTable>
    </div>
  )
}
