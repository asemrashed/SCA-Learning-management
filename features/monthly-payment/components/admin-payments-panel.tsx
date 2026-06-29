"use client"

import { useEffect, useMemo, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DashboardTable } from "@/components/dashboard-table"
import { TableRowActions } from "@/components/table-row-actions"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
  useSetPaymentAccessMutation,
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
  const [approveTarget, setApproveTarget] = useState<{ id: string; name: string } | null>(null)
  const [approveAmount, setApproveAmount] = useState("")
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
  const [setPaymentAccess, { isLoading: settingAccess }] = useSetPaymentAccessMutation()

  const payments = data?.data ?? []
  const unpaidStudents = unpaidData?.data ?? []
  const batchOptions = courseId
    ? (courseBatchesData?.data ?? [])
    : (batchesData?.data ?? [])

  useEffect(() => {
    setBatchId("")
  }, [courseId])

  async function handleApprove(id: string, amountRaw: string) {
    const raw = amountRaw.trim()
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
      setApproveTarget(null)
      setApproveAmount("")
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

  async function handleAccessToggle(
    enrollmentId: string,
    billingMonth: string,
    action: "grant" | "revoke",
  ) {
    setActionError(null)
    try {
      await setPaymentAccess({ enrollmentId, body: { billingMonth, action } }).unwrap()
    } catch {
      setActionError(
        action === "grant"
          ? "Could not grant access."
          : "Could not block access.",
      )
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
    <>
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
          <DashboardTable>
            <table className="w-full min-w-[900px] text-sm">
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
                      <TableRowActions
                        actions={
                          !readOnly && item.status === MonthlyPaymentStatus.REQUESTED
                            ? [
                                {
                                  label: "Approve",
                                  disabled: reviewing,
                                  onClick: () => {
                                    setApproveTarget({ id: item.id, name: item.student.name })
                                    setApproveAmount("")
                                  },
                                },
                                {
                                  label: "Deny",
                                  destructive: true,
                                  disabled: reviewing,
                                  onClick: () => void handleReject(item.id),
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
          </DashboardTable>
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
          <DashboardTable>
            <table className="w-full min-w-[900px] text-sm">
              <thead className="bg-muted/50 text-left">
                <tr>
                  <th className="px-4 py-3 font-medium">Student</th>
                  <th className="px-4 py-3 font-medium">Course / Batch</th>
                  <th className="px-4 py-3 font-medium">Month</th>
                  <th className="px-4 py-3 font-medium">Deadline</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  {!readOnly ? <th className="px-4 py-3 font-medium">Access</th> : null}
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
                        {item.hasAccessGrant ? (
                          <Badge variant="outline">Access granted</Badge>
                        ) : item.isAccessBlocked ? (
                          <Badge variant="outline">Access blocked</Badge>
                        ) : item.isPastDeadline ? null : (
                          <Badge variant="outline">Before deadline</Badge>
                        )}
                        {item.currentMonthRequest ? (
                          <Badge>{item.currentMonthRequest.status}</Badge>
                        ) : null}
                      </div>
                    </td>
                    {!readOnly ? (
                      <td className="px-4 py-3">
                        {item.isPastDeadline ? (
                          item.hasAccessGrant ? (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              disabled={settingAccess}
                              onClick={() =>
                                void handleAccessToggle(
                                  item.enrollment.id,
                                  item.billingMonth,
                                  "revoke",
                                )
                              }
                            >
                              Block access
                            </Button>
                          ) : (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              disabled={settingAccess}
                              onClick={() =>
                                void handleAccessToggle(
                                  item.enrollment.id,
                                  item.billingMonth,
                                  "grant",
                                )
                              }
                            >
                              Give access
                            </Button>
                          )
                        ) : (
                          <span className="text-xs text-muted-foreground">Before deadline</span>
                        )}
                      </td>
                    ) : null}
                  </tr>
                ))}
              </tbody>
            </table>
          </DashboardTable>
        )}
      </TabsContent>
    </Tabs>

    <Dialog
      open={approveTarget != null}
      onOpenChange={(open) => {
        if (!open) {
          setApproveTarget(null)
          setApproveAmount("")
        }
      }}
    >
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Approve payment</DialogTitle>
          <DialogDescription>
            Enter the approved amount for {approveTarget?.name ?? "this student"}.
          </DialogDescription>
        </DialogHeader>
        <Input
          type="number"
          min="1"
          step="0.01"
          placeholder="Amount (৳)"
          value={approveAmount}
          onChange={(e) => setApproveAmount(e.target.value)}
        />
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setApproveTarget(null)}>
            Cancel
          </Button>
          <Button
            type="button"
            disabled={reviewing}
            onClick={() => {
              if (approveTarget) {
                void handleApprove(approveTarget.id, approveAmount)
              }
            }}
          >
            Approve
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  )
}
