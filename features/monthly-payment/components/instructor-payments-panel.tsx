"use client"

import { useEffect, useMemo, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useListBatchesByCourseQuery, useListBatchesQuery } from "@/features/batch/api"
import { useListCoursesQuery } from "@/features/course/api"
import { useListInstructorMonthlyPaymentsQuery } from "@/features/monthly-payment/api"
import { formatBdtMinor } from "@/lib/format-currency"
import { DeliveryMode, EnrollmentKind } from "@/types/api"

function formatBillingMonth(billingMonth: string): string {
  const [year, month] = billingMonth.split("-")
  const date = new Date(Number(year), Number(month) - 1, 1)
  return date.toLocaleDateString("en-GB", { month: "long", year: "numeric" })
}

function productTitle(item: {
  enrollment: {
    kind: EnrollmentKind
    courseTitle: string
    batchTitle: string | null
  }
}): string {
  return item.enrollment.kind === EnrollmentKind.BATCH
    ? `${item.enrollment.courseTitle} · ${item.enrollment.batchTitle}`
    : item.enrollment.courseTitle
}

export function InstructorPaymentsPanel() {
  const [courseId, setCourseId] = useState<string>("")
  const [batchId, setBatchId] = useState<string>("")
  const [search, setSearch] = useState("")

  const { data: coursesData } = useListCoursesQuery({ deliveryMode: DeliveryMode.LIVE, pageSize: 100 })
  const { data: batchesData } = useListBatchesQuery({ pageSize: 100 })
  const { data: courseBatchesData } = useListBatchesByCourseQuery(courseId, {
    skip: !courseId,
  })

  const queryParams = useMemo(
    () => ({
      courseId: courseId || undefined,
      batchId: batchId || undefined,
      search: search.trim() || undefined,
      pageSize: 50,
    }),
    [courseId, batchId, search],
  )

  const { data, isLoading, error } = useListInstructorMonthlyPaymentsQuery(queryParams)
  const payments = data?.data ?? []
  const batchOptions = courseId
    ? (courseBatchesData?.data ?? [])
    : (batchesData?.data ?? [])

  useEffect(() => {
    setBatchId("")
  }, [courseId])

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-3">
        <Select value={courseId || "all"} onValueChange={(v) => setCourseId(v === "all" ? "" : v)}>
          <SelectTrigger>
            <SelectValue placeholder="Course" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All courses</SelectItem>
            {(coursesData?.data ?? []).map((course) => (
              <SelectItem key={course.id} value={course.id}>
                {course.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={batchId || "all"} onValueChange={(v) => setBatchId(v === "all" ? "" : v)}>
          <SelectTrigger>
            <SelectValue placeholder="Batch" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All batches</SelectItem>
            {batchOptions.map((batch) => (
              <SelectItem key={batch.id} value={batch.id}>
                {batch.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          placeholder="Search name, phone, roll, or student ID"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Loading payment history…</p>
      ) : error ? (
        <p className="text-destructive">Could not load payment history.</p>
      ) : payments.length === 0 ? (
        <div className="rounded-xl border border-dashed p-10 text-center text-muted-foreground">
          No approved payments match your filters.
        </div>
      ) : (
        <div className="space-y-4">
          {payments.map((item) => (
            <div key={item.id} className="rounded-xl border bg-card p-5">
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <Badge variant="secondary">{formatBillingMonth(item.billingMonth)}</Badge>
                <Badge>{item.status}</Badge>
              </div>
              <h3 className="text-lg font-semibold">{productTitle(item)}</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {item.student.name} · {item.student.phone}
                {item.student.rollNumber ? ` · Roll ${item.student.rollNumber}` : ""}
              </p>
              <p className="mt-2 text-sm">
                Enrollment status:{" "}
                <span className="font-medium">{item.enrollment.status}</span>
              </p>
              {item.amountMinor != null ? (
                <p className="mt-1 text-sm font-medium">
                  Paid: {formatBdtMinor(item.amountMinor)}
                </p>
              ) : null}
              <p className="mt-1 text-xs text-muted-foreground">
                Approved {item.reviewedAt ? new Date(item.reviewedAt).toLocaleString() : "—"}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
