"use client"

import { useEffect, useMemo, useState } from "react"
import { Check, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useListBatchesByCourseQuery, useListBatchesQuery } from "@/features/batch/api"
import { useListCoursesQuery } from "@/features/course/api"
import {
  useListAdminMonthlyPaymentsQuery,
  useListUnpaidStudentsQuery,
  useReviewMonthlyPaymentMutation,
} from "@/features/monthly-payment/api"
import { formatBdtMinor } from "@/lib/format-currency"
import { DeliveryMode, EnrollmentKind, MonthlyPaymentStatus } from "@/types/api"

function formatBillingMonth(billingMonth: string): string {
  const [year, month] = billingMonth.split("-")
  const date = new Date(Number(year), Number(month) - 1, 1)
  return date.toLocaleDateString("en-GB", { month: "long", year: "numeric" })
}

function currentBillingMonthLabel(): string {
  const now = new Date()
  const billingMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
  return formatBillingMonth(billingMonth)
}

function formatDeadline(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
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

interface AdminPaymentsPanelProps {
  defaultStatus?: MonthlyPaymentStatus
  readOnly?: boolean
}

export function AdminPaymentsPanel({
  defaultStatus = MonthlyPaymentStatus.REQUESTED,
  readOnly = false,
}: AdminPaymentsPanelProps) {
  const [status, setStatus] = useState<MonthlyPaymentStatus | "ALL">(defaultStatus)
  const [courseId, setCourseId] = useState<string>("")
  const [batchId, setBatchId] = useState<string>("")
  const [search, setSearch] = useState("")
  const [amounts, setAmounts] = useState<Record<string, string>>({})
  const [actionError, setActionError] = useState<string | null>(null)

  const { data: coursesData } = useListCoursesQuery({ deliveryMode: DeliveryMode.LIVE, pageSize: 100 })
  const { data: batchesData } = useListBatchesQuery({ pageSize: 100 })
  const { data: courseBatchesData } = useListBatchesByCourseQuery(courseId, {
    skip: !courseId,
  })

  const filterParams = useMemo(
    () => ({
      courseId: courseId || undefined,
      batchId: batchId || undefined,
      search: search.trim() || undefined,
      pageSize: 50,
    }),
    [courseId, batchId, search],
  )

  const paymentQueryParams = useMemo(
    () => ({
      ...filterParams,
      status: status === "ALL" ? undefined : status,
    }),
    [filterParams, status],
  )

  const { data, isLoading, error } = useListAdminMonthlyPaymentsQuery(paymentQueryParams)
  const {
    data: unpaidData,
    isLoading: unpaidLoading,
    error: unpaidError,
  } = useListUnpaidStudentsQuery(filterParams)
  const [reviewPayment, { isLoading: reviewing }] = useReviewMonthlyPaymentMutation()

  const payments = data?.data ?? []
  const unpaidStudents = unpaidData?.data ?? []
  const batchOptions = courseId
    ? (courseBatchesData?.data ?? [])
    : (batchesData?.data ?? [])

  useEffect(() => {
    setBatchId("")
  }, [courseId])

  async function handleApprove(id: string) {
    const raw = amounts[id]?.trim()
    const major = raw ? Number(raw) : NaN
    if (!raw || Number.isNaN(major) || major <= 0) {
      setActionError("Enter a valid payment amount before approving.")
      return
    }
    setActionError(null)
    try {
      await reviewPayment({
        id,
        body: { action: "approve", amountMinor: Math.round(major * 100) },
      }).unwrap()
      setAmounts((prev) => {
        const next = { ...prev }
        delete next[id]
        return next
      })
    } catch {
      setActionError("Could not approve payment.")
    }
  }

  async function handleReject(id: string) {
    setActionError(null)
    try {
      await reviewPayment({ id, body: { action: "reject" } }).unwrap()
    } catch {
      setActionError("Could not reject payment.")
    }
  }

  const searchFilters = (
    <div className="flex w-full flex-col gap-3 sm:flex-row lg:max-w-3xl lg:flex-1 lg:justify-end">
      <Select value={courseId || "all"} onValueChange={(v) => setCourseId(v === "all" ? "" : v)}>
        <SelectTrigger className="w-full sm:flex-1">
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
        <SelectTrigger className="w-full sm:flex-1">
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
        className="w-full sm:flex-1"
        placeholder="Search name, phone, roll, or ID"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
    </div>
  )

  return (
    <Tabs defaultValue="requests" className="space-y-4">
      <TabsList>
        <TabsTrigger value="requests">Payment requests</TabsTrigger>
        <TabsTrigger value="unpaid">Unpaid students</TabsTrigger>
      </TabsList>

      {actionError ? <p className="text-sm text-destructive">{actionError}</p> : null}

      <TabsContent value="requests" className="space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <Select
            value={status}
            onValueChange={(value) => setStatus(value as MonthlyPaymentStatus | "ALL")}
          >
            <SelectTrigger className="w-full lg:w-[220px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={MonthlyPaymentStatus.REQUESTED}>Pending requests</SelectItem>
              <SelectItem value={MonthlyPaymentStatus.APPROVED}>Approved</SelectItem>
              <SelectItem value={MonthlyPaymentStatus.REJECTED}>Rejected</SelectItem>
              <SelectItem value="ALL">All</SelectItem>
            </SelectContent>
          </Select>

          {searchFilters}
        </div>

        {isLoading ? (
          <p className="text-muted-foreground">Loading payments…</p>
        ) : error ? (
          <p className="text-destructive">Could not load payments.</p>
        ) : payments.length === 0 ? (
          <div className="rounded-xl border border-dashed p-10 text-center text-muted-foreground">
            No payment records match your filters.
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left">
                <tr>
                  <th className="px-4 py-3 font-medium">Student</th>
                  <th className="px-4 py-3 font-medium">Course / Batch</th>
                  <th className="px-4 py-3 font-medium">Month</th>
                  <th className="px-4 py-3 font-medium">Requested</th>
                  <th className="px-4 py-3 font-medium">Amount</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((item) => (
                  <tr key={item.id} className="border-t">
                    <td className="px-4 py-3">
                      <div className="font-medium">{item.student.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {item.student.phone}
                        {item.student.rollNumber ? ` · Roll ${item.student.rollNumber}` : ""}
                      </div>
                    </td>
                    <td className="px-4 py-3">{productTitle(item)}</td>
                    <td className="px-4 py-3">
                      <Badge variant="secondary">{formatBillingMonth(item.billingMonth)}</Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(item.requestedAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      {item.amountMinor != null ? formatBdtMinor(item.amountMinor) : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <Badge>{item.status}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      {!readOnly && item.status === MonthlyPaymentStatus.REQUESTED ? (
                        <div className="flex min-w-[220px] flex-col gap-2">
                          <Input
                            id={`amount-${item.id}`}
                            type="number"
                            min="1"
                            step="0.01"
                            placeholder="Amount (৳)"
                            value={amounts[item.id] ?? ""}
                            onChange={(e) =>
                              setAmounts((prev) => ({ ...prev, [item.id]: e.target.value }))
                            }
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleApprove(item.id)}
                              disabled={reviewing}
                            >
                              <Check className="mr-1 h-4 w-4" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleReject(item.id)}
                              disabled={reviewing}
                            >
                              <X className="mr-1 h-4 w-4" />
                              Deny
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </TabsContent>

      <TabsContent value="unpaid" className="space-y-4">
        {searchFilters}
        <p className="text-sm text-muted-foreground">
          Active batch students without an approved payment for{" "}
          {unpaidStudents[0]
            ? formatBillingMonth(unpaidStudents[0].billingMonth)
            : currentBillingMonthLabel()}
          . Payment deadline is the 20th of each month.
        </p>

        {unpaidLoading ? (
          <p className="text-muted-foreground">Loading unpaid students…</p>
        ) : unpaidError ? (
          <p className="text-destructive">Could not load unpaid students.</p>
        ) : unpaidStudents.length === 0 ? (
          <div className="rounded-xl border border-dashed p-10 text-center text-muted-foreground">
            All students have paid for the current billing month.
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left">
                <tr>
                  <th className="px-4 py-3 font-medium">Student</th>
                  <th className="px-4 py-3 font-medium">Course / Batch</th>
                  <th className="px-4 py-3 font-medium">Month</th>
                  <th className="px-4 py-3 font-medium">Deadline</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {unpaidStudents.map((item) => (
                  <tr key={item.enrollment.id} className="border-t">
                    <td className="px-4 py-3">
                      <div className="font-medium">{item.student.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {item.student.phone}
                        {item.student.rollNumber ? ` · Roll ${item.student.rollNumber}` : ""}
                      </div>
                    </td>
                    <td className="px-4 py-3">{productTitle(item)}</td>
                    <td className="px-4 py-3">
                      <Badge variant="secondary">{formatBillingMonth(item.billingMonth)}</Badge>
                    </td>
                    <td className="px-4 py-3">{formatDeadline(item.paymentDeadline)}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="destructive">Unpaid</Badge>
                        {item.isAccessBlocked ? (
                          <Badge variant="outline">Access blocked</Badge>
                        ) : item.isPastDeadline ? null : (
                          <Badge variant="outline">Before deadline</Badge>
                        )}
                        {item.currentMonthRequest ? (
                          <Badge>{item.currentMonthRequest.status}</Badge>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </TabsContent>
    </Tabs>
  )
}
