"use client"

import { useEffect, useMemo, useState } from "react"
import { useDispatch } from "react-redux"
import { Plus } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DashboardTable } from "@/components/dashboard-table"
import { TableRowActions, type TableRowAction } from "@/components/table-row-actions"
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useListBatchesByCourseQuery, useListBatchesQuery } from "@/features/batch/api"
import { useListCoursesQuery } from "@/features/course/api"
import { useReviewEnrollmentRequestMutation } from "@/features/enrollment/api"
import {
  AdminPaymentFormDialog,
  type AdminPaymentFormPrefill,
} from "@/features/monthly-payment/components/admin-payment-form-dialog"
import {
  monthlyPaymentApi,
  useListAdminMonthlyPaymentsQuery,
  useListUnpaidStudentsQuery,
  useReviewMonthlyPaymentMutation,
  useSetPaymentAccessMutation,
} from "@/features/monthly-payment/api"
import {
  currentBillingMonthValue,
  formatBillingMonthLabel,
} from "@/lib/billing-month"
import { formatBdtMinor } from "@/lib/format-currency"
import {
  DeliveryMode,
  EnrollmentKind,
  MonthlyPaymentStatus,
  type MonthlyPaymentRecord,
  type UnpaidStudentRecord,
} from "@/types/api"

function paymentStatusLabel(item: {
  billingMonth: string
  status: MonthlyPaymentStatus
  enrollment: { isFullyPaid: boolean }
}): string {
  if (item.enrollment.isFullyPaid && item.billingMonth === "ENROLLMENT") {
    return "Full paid"
  }
  return item.status
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

const PAYMENT_TABS = [
  { value: MonthlyPaymentStatus.REQUESTED, label: "Pending" },
  { value: MonthlyPaymentStatus.APPROVED, label: "Approved" },
  { value: MonthlyPaymentStatus.REJECTED, label: "Rejected" },
  { value: "unpaid" as const, label: "Unpaid students" },
]

export function AdminPaymentsPanel({
  defaultStatus = MonthlyPaymentStatus.REQUESTED,
  readOnly = false,
}: AdminPaymentsPanelProps) {
  const dispatch = useDispatch()
  const [activeTab, setActiveTab] = useState<MonthlyPaymentStatus | "unpaid">(defaultStatus)
  const [courseId, setCourseId] = useState<string>("")
  const [batchId, setBatchId] = useState<string>("")
  const [search, setSearch] = useState("")
  const [actionError, setActionError] = useState<string | null>(null)

  const [paymentFormOpen, setPaymentFormOpen] = useState(false)
  const [paymentFormMode, setPaymentFormMode] = useState<"create" | "edit">("create")
  const [paymentFormPrefill, setPaymentFormPrefill] = useState<AdminPaymentFormPrefill | undefined>()
  const [editPayment, setEditPayment] = useState<MonthlyPaymentRecord | null>(null)

  const [approveTarget, setApproveTarget] = useState<MonthlyPaymentRecord | null>(null)
  const [approveAmount, setApproveAmount] = useState("")
  const [approveMonth, setApproveMonth] = useState(currentBillingMonthValue())
  const [approveFullPaid, setApproveFullPaid] = useState(false)

  const { data: coursesData } = useListCoursesQuery({ deliveryMode: DeliveryMode.LIVE, pageSize: 100 })
  const { data: batchesData } = useListBatchesQuery({ pageSize: 100 })
  const { data: courseBatchesData } = useListBatchesByCourseQuery(courseId, { skip: !courseId })

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
      status: activeTab === "unpaid" ? undefined : activeTab,
    }),
    [filterParams, activeTab],
  )

  const { data, isLoading, error } = useListAdminMonthlyPaymentsQuery(paymentQueryParams, {
    skip: activeTab === "unpaid",
  })
  const {
    data: unpaidData,
    isLoading: unpaidLoading,
    error: unpaidError,
  } = useListUnpaidStudentsQuery(filterParams, { skip: activeTab !== "unpaid" })
  const [reviewPayment, { isLoading: reviewing }] = useReviewMonthlyPaymentMutation()
  const [setPaymentAccess, { isLoading: settingAccess }] = useSetPaymentAccessMutation()
  const [reviewEnrollment, { isLoading: reviewingEnrollment }] = useReviewEnrollmentRequestMutation()

  const payments = data?.data ?? []
  const unpaidStudents = unpaidData?.data ?? []
  const batchOptions = courseId ? (courseBatchesData?.data ?? []) : (batchesData?.data ?? [])

  useEffect(() => {
    setBatchId("")
  }, [courseId])

  function openCreatePayment(prefill?: AdminPaymentFormPrefill) {
    setPaymentFormMode("create")
    setEditPayment(null)
    setPaymentFormPrefill(prefill)
    setPaymentFormOpen(true)
  }

  function openEditPayment(payment: MonthlyPaymentRecord) {
    setPaymentFormMode("edit")
    setEditPayment(payment)
    setPaymentFormPrefill(undefined)
    setPaymentFormOpen(true)
  }

  async function handleApproveRequest() {
    if (!approveTarget) return
    const raw = approveAmount.trim()
    const major = raw ? Number(raw) : NaN
    if (!raw || Number.isNaN(major) || major <= 0) {
      setActionError("Enter a valid payment amount before approving.")
      return
    }
    setActionError(null)
    try {
      await reviewPayment({
        id: approveTarget.id,
        body: {
          action: "approve",
          amountMinor: Math.round(major * 100),
          billingMonth: approveMonth,
          markFullyPaid: approveFullPaid,
        },
      }).unwrap()
      setApproveTarget(null)
      setApproveAmount("")
      setApproveFullPaid(false)
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

  function invalidatePaymentLists() {
    dispatch(
      monthlyPaymentApi.util.invalidateTags([
        { type: "MonthlyPayment", id: "LIST" },
        { type: "MonthlyPayment", id: "UNPAID" },
      ]),
    )
  }

  async function handleBlockAccess(enrollmentId: string) {
    setActionError(null)
    try {
      await reviewEnrollment({ id: enrollmentId, body: { action: "block" } }).unwrap()
      invalidatePaymentLists()
    } catch {
      setActionError("Could not block access.")
    }
  }

  async function handleGiveAccess(enrollmentId: string, billingMonth: string) {
    setActionError(null)
    try {
      await reviewEnrollment({ id: enrollmentId, body: { action: "unblock" } }).unwrap()
      await setPaymentAccess({
        enrollmentId,
        body: { billingMonth, action: "grant" },
      }).unwrap()
      invalidatePaymentLists()
    } catch {
      setActionError("Could not give access.")
    }
  }

  function paymentRowActions(item: MonthlyPaymentRecord): TableRowAction[] {
    if (readOnly) return []
    const actions: TableRowAction[] = []

    if (item.status === MonthlyPaymentStatus.APPROVED) {
      actions.push({
        label: "Edit payment",
        onClick: () => openEditPayment(item),
      })
    }

    if (item.status === MonthlyPaymentStatus.REQUESTED) {
      actions.push({
        label: "Approve",
        onClick: () => {
          setApproveTarget(item)
          setApproveAmount("")
          setApproveMonth(
            item.billingMonth === "ENROLLMENT" ? currentBillingMonthValue() : item.billingMonth,
          )
          setApproveFullPaid(false)
        },
      })
      actions.push({
        label: "Deny",
        destructive: true,
        onClick: () => void handleReject(item.id),
      })
    }

    actions.push({
      label: "Block access",
      destructive: true,
      onClick: () => void handleBlockAccess(item.enrollment.id),
    })

    actions.push({
      label: "Give access",
      onClick: () =>
        void handleGiveAccess(
          item.enrollment.id,
          item.billingMonth === "ENROLLMENT" ? currentBillingMonthValue() : item.billingMonth,
        ),
    })

    return actions
  }

  function unpaidRowActions(item: UnpaidStudentRecord): TableRowAction[] {
    if (readOnly) return []
    const actions: TableRowAction[] = []

    const approvedPayment = item.currentMonthRequest?.status === MonthlyPaymentStatus.APPROVED
      ? item.currentMonthRequest
      : null

    if (approvedPayment) {
      actions.push({
        label: "Edit payment",
        onClick: () => openEditPayment(approvedPayment),
      })
    }

    actions.push({
      label: "Block access",
      destructive: true,
      onClick: () => void handleBlockAccess(item.enrollment.id),
    })

    actions.push({
      label: "Give access",
      onClick: () => void handleGiveAccess(item.enrollment.id, item.billingMonth),
    })

    return actions
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
        placeholder="Search name, phone, or ID"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
    </div>
  )

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Manage payment history, manual fee entries, and student access overrides.
        </p>
        {!readOnly ? (
          <Button type="button" className="rounded-xl" onClick={() => openCreatePayment()}>
            <Plus className="mr-2 h-4 w-4" />
            New payment
          </Button>
        ) : null}
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as MonthlyPaymentStatus | "unpaid")}
        className="space-y-4"
      >
        <TabsList>
          {PAYMENT_TABS.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {actionError ? <p className="text-sm text-destructive">{actionError}</p> : null}

        {activeTab !== "unpaid" ? (
          <div className="space-y-4">
            {searchFilters}

            {isLoading ? (
              <p className="text-muted-foreground">Loading payments…</p>
            ) : error ? (
              <p className="text-destructive">Could not load payments.</p>
            ) : payments.length === 0 ? (
              <div className="rounded-xl border border-dashed p-10 text-center text-muted-foreground">
                No {activeTab.toLowerCase()} payment records match your filters.
              </div>
            ) : (
              <DashboardTable>
                <table className="w-full min-w-[980px] text-sm">
                  <thead className="bg-muted/50 text-left">
                    <tr>
                      <th className="px-4 py-3 font-medium">Student</th>
                      <th className="px-4 py-3 font-medium">Course / Batch</th>
                      <th className="px-4 py-3 font-medium">Month</th>
                      <th className="px-4 py-3 font-medium">Recorded</th>
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
                            {item.student.idNumber ? ` · ID ${item.student.idNumber}` : ""}
                          </div>
                        </td>
                        <td className="px-4 py-3">{productTitle(item)}</td>
                        <td className="px-4 py-3">
                          <Badge variant="secondary">{formatBillingMonthLabel(item.billingMonth)}</Badge>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {new Date(item.reviewedAt ?? item.requestedAt).toLocaleString()}
                        </td>
                        <td className="px-4 py-3">
                          {item.amountMinor != null ? formatBdtMinor(item.amountMinor) : "—"}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-2">
                            <Badge
                              variant={
                                item.enrollment.isFullyPaid && item.billingMonth === "ENROLLMENT"
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {paymentStatusLabel(item)}
                            </Badge>
                            {item.enrollment.isBlocked ? (
                              <Badge variant="destructive">Blocked</Badge>
                            ) : null}
                            {item.enrollment.isFullyPaid ? (
                              <Badge variant="outline">Full paid waiver</Badge>
                            ) : null}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <TableRowActions actions={paymentRowActions(item)} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </DashboardTable>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {searchFilters}
            <p className="text-sm text-muted-foreground">
              Active batch students without an approved payment for{" "}
              {unpaidStudents[0]
                ? formatBillingMonthLabel(unpaidStudents[0].billingMonth)
                : formatBillingMonthLabel(currentBillingMonthValue())}
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
                <table className="w-full min-w-[980px] text-sm">
                  <thead className="bg-muted/50 text-left">
                    <tr>
                      <th className="px-4 py-3 font-medium">Student</th>
                      <th className="px-4 py-3 font-medium">Course / Batch</th>
                      <th className="px-4 py-3 font-medium">Month</th>
                      <th className="px-4 py-3 font-medium">Deadline</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      {!readOnly ? <th className="px-4 py-3 font-medium">Actions</th> : null}
                    </tr>
                  </thead>
                  <tbody>
                    {unpaidStudents.map((item) => (
                      <tr key={item.enrollment.id} className="border-t">
                        <td className="px-4 py-3">
                          <div className="font-medium">{item.student.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {item.student.phone}
                            {item.student.idNumber ? ` · ID ${item.student.idNumber}` : ""}
                          </div>
                        </td>
                        <td className="px-4 py-3">{productTitle(item)}</td>
                        <td className="px-4 py-3">
                          <Badge variant="secondary">{formatBillingMonthLabel(item.billingMonth)}</Badge>
                        </td>
                        <td className="px-4 py-3">{formatDeadline(item.paymentDeadline)}</td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="destructive">Unpaid</Badge>
                            {item.isBlocked ? <Badge variant="destructive">Blocked</Badge> : null}
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
                            <TableRowActions actions={unpaidRowActions(item)} />
                          </td>
                        ) : null}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </DashboardTable>
            )}
          </div>
        )}
      </Tabs>

      <AdminPaymentFormDialog
        open={paymentFormOpen}
        onOpenChange={setPaymentFormOpen}
        mode={paymentFormMode}
        payment={editPayment}
        prefill={paymentFormPrefill}
      />

      <Dialog
        open={approveTarget != null}
        onOpenChange={(open) => {
          if (!open) {
            setApproveTarget(null)
            setApproveAmount("")
            setApproveFullPaid(false)
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Approve payment request</DialogTitle>
            <DialogDescription>
              Confirm the month and amount received for {approveTarget?.student.name ?? "this student"}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="approve-month">Billing month</Label>
              <Input
                id="approve-month"
                type="month"
                value={approveMonth}
                onChange={(e) => setApproveMonth(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Student request month:{" "}
                {approveTarget ? formatBillingMonthLabel(approveTarget.billingMonth) : "—"}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="approve-amount">Amount received (৳)</Label>
              <Input
                id="approve-amount"
                type="number"
                min="1"
                step="0.01"
                placeholder="Amount (৳)"
                value={approveAmount}
                onChange={(e) => setApproveAmount(e.target.value)}
              />
            </div>

            <label className="flex items-start gap-3 rounded-lg border p-3">
              <Checkbox
                checked={approveFullPaid}
                onCheckedChange={(v) => setApproveFullPaid(v === true)}
              />
              <span className="space-y-1">
                <span className="block text-sm font-medium">Full paid (admin waiver)</span>
                <span className="block text-xs text-muted-foreground">
                  Mark as fully paid even if the amount is below the course price.
                </span>
              </span>
            </label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setApproveTarget(null)}>
              Cancel
            </Button>
            <Button type="button" disabled={reviewing} onClick={() => void handleApproveRequest()}>
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
