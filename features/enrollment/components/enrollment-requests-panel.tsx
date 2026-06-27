"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
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
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import {
  useGetAdminEnrollmentOverviewQuery,
  useListAdminEnrollmentRequestsQuery,
  useReviewEnrollmentRequestMutation,
} from "@/features/enrollment/api"
import { useGetAdminPaymentSummaryQuery } from "@/features/monthly-payment/api"
import { formatBdtMinor } from "@/lib/format-currency"
import { EnrollmentKind, EnrollmentStatus } from "@/types/api"
import { deliveryModeLabel } from "@/lib/product-vocabulary"
import { cn } from "@/lib/utils"
import { ManualEnrollmentDialog } from "@/features/enrollment/components/manual-enrollment-dialog"

const PAGE_SIZE = 10

const STATUS_FILTERS: { label: string; value: EnrollmentStatus | "ALL" }[] = [
  { label: "All", value: "ALL" },
  { label: "Pending", value: EnrollmentStatus.PENDING },
  { label: "Active", value: EnrollmentStatus.ACTIVE },
  { label: "Cancelled", value: EnrollmentStatus.CANCELLED },
  { label: "Completed", value: EnrollmentStatus.COMPLETED },
]

function productTitle(item: {
  kind: EnrollmentKind
  batch: { title: string; course?: { title: string } } | null
  course: { title: string } | null
}): string {
  return item.kind === EnrollmentKind.BATCH
    ? `${item.batch!.course?.title ?? item.batch!.title} · ${item.batch!.title}`
    : item.course!.title
}

function statusBadgeVariant(status: EnrollmentStatus): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case EnrollmentStatus.PENDING:
      return "secondary"
    case EnrollmentStatus.ACTIVE:
      return "default"
    case EnrollmentStatus.CANCELLED:
      return "destructive"
    case EnrollmentStatus.COMPLETED:
      return "outline"
    default:
      return "secondary"
  }
}

export function EnrollmentRequestsPanel() {
  const [statusFilter, setStatusFilter] = useState<EnrollmentStatus | "ALL">("ALL")
  const [page, setPage] = useState(1)
  const [actionError, setActionError] = useState<string | null>(null)
  const [manualOpen, setManualOpen] = useState(false)
  const [approveTarget, setApproveTarget] = useState<{ id: string; name: string } | null>(null)
  const [approveRoll, setApproveRoll] = useState("")

  const { data: overviewData, isLoading: overviewLoading } = useGetAdminEnrollmentOverviewQuery()
  const { data: paymentSummary, isLoading: paymentSummaryLoading } = useGetAdminPaymentSummaryQuery()
  const { data, isLoading, error, isFetching } = useListAdminEnrollmentRequestsQuery({
    ...(statusFilter !== "ALL" ? { status: statusFilter } : {}),
    page,
    pageSize: PAGE_SIZE,
  })
  const [reviewEnrollment, { isLoading: reviewing }] = useReviewEnrollmentRequestMutation()

  const overview = overviewData?.data
  const requests = data?.data ?? []
  const meta = data?.meta
  const totalPages = meta ? Math.max(1, Math.ceil(meta.total / meta.pageSize)) : 1

  function handleStatusChange(next: EnrollmentStatus | "ALL") {
    setStatusFilter(next)
    setPage(1)
  }

  async function handleApprove(id: string, rollNumber: string) {
    if (!rollNumber.trim()) {
      setActionError("Enter a roll number before approving.")
      return
    }
    setActionError(null)
    try {
      await reviewEnrollment({ id, body: { action: "approve", rollNumber: rollNumber.trim() } }).unwrap()
      setApproveTarget(null)
      setApproveRoll("")
    } catch {
      setActionError("Could not approve enrollment.")
    }
  }

  async function handleReject(id: string) {
    setActionError(null)
    try {
      await reviewEnrollment({ id, body: { action: "reject" } }).unwrap()
    } catch {
      setActionError("Could not reject enrollment.")
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <OverviewCard label="Total" value={overview?.total} isLoading={overviewLoading} />
        <OverviewCard label="Pending" value={overview?.pending} isLoading={overviewLoading} />
        <OverviewCard label="Active" value={overview?.active} isLoading={overviewLoading} />
        <OverviewCard label="Cancelled" value={overview?.cancelled} isLoading={overviewLoading} />
        <OverviewCard label="Completed" value={overview?.completed} isLoading={overviewLoading} />
        <OverviewCard
          label="Total Revenue"
          value={formatBdtMinor(paymentSummary?.data.totalRevenueMinor ?? 0)}
          isLoading={paymentSummaryLoading}
        />
        <OverviewCard
          label="Total Due"
          value={formatBdtMinor(paymentSummary?.data.totalDueMinor ?? 0)}
          isLoading={paymentSummaryLoading}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((filter) => (
          <Button
            key={filter.value}
            type="button"
            size="sm"
            variant={statusFilter === filter.value ? "default" : "outline"}
            onClick={() => handleStatusChange(filter.value)}
          >
            {filter.label}
          </Button>
        ))}
        </div>
        <Button type="button" onClick={() => setManualOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New
        </Button>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Loading enrollments…</p>
      ) : error ? (
        <p className="text-destructive">Could not load enrollments.</p>
      ) : requests.length === 0 ? (
        <div className="rounded-xl border border-dashed p-10 text-center text-muted-foreground">
          No enrollments found{statusFilter !== "ALL" ? ` with status “${statusFilter.toLowerCase()}”` : ""}.
        </div>
      ) : (
        <div className="space-y-4">
          {actionError ? <p className="text-sm text-destructive">{actionError}</p> : null}
          <DashboardTable>
            <table className="w-full min-w-[900px] text-sm">
              <thead className="bg-muted/50 text-left">
                <tr>
                  <th className="px-4 py-3 font-medium">Student</th>
                  <th className="px-4 py-3 font-medium">Course / Batch</th>
                  <th className="px-4 py-3 font-medium">Mode</th>
                  <th className="px-4 py-3 font-medium">Roll</th>
                  <th className="px-4 py-3 font-medium">Requested</th>
                  <th className="px-4 py-3 font-medium">Seats</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((item) => (
                  <tr key={item.id} className="border-t">
                    <td className="px-4 py-3">
                      <div className="font-medium">{item.student.name}</div>
                      <div className="text-xs text-muted-foreground">{item.student.phone}</div>
                    </td>
                    <td className="px-4 py-3">{productTitle(item)}</td>
                    <td className="px-4 py-3">
                      <Badge variant="secondary">
                        {deliveryModeLabel(item.kind === EnrollmentKind.BATCH ? "LIVE" : "RECORDED")}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{item.rollNumber ?? "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(item.enrolledAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {item.totalEnrollments}
                      {item.totalSeats != null ? (
                        <>
                          {" / "}
                          {item.totalSeats}
                          {item.totalSeats - item.totalEnrollments <= 0 ? (
                            <span className="text-destructive"> (full)</span>
                          ) : null}
                        </>
                      ) : null}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={statusBadgeVariant(item.status)}>{item.status}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <TableRowActions
                        actions={
                          item.status === EnrollmentStatus.PENDING
                            ? [
                                {
                                  label: "Approve",
                                  disabled: reviewing,
                                  onClick: () => {
                                    setApproveTarget({ id: item.id, name: item.student.name })
                                    setApproveRoll("")
                                  },
                                },
                                {
                                  label: "Reject",
                                  destructive: true,
                                  disabled: reviewing,
                                  onClick: () => {
                                    if (confirm(`Reject enrollment for ${item.student.name}?`)) {
                                      void handleReject(item.id)
                                    }
                                  },
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
        </div>
      )}

      {meta && meta.total > PAGE_SIZE ? (
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(meta.page - 1) * meta.pageSize + 1}–
            {Math.min(meta.page * meta.pageSize, meta.total)} of {meta.total}
            {isFetching ? " · Updating…" : ""}
          </p>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  className={cn(page <= 1 && "pointer-events-none opacity-50")}
                  onClick={(e) => {
                    e.preventDefault()
                    if (page > 1) setPage((p) => p - 1)
                  }}
                />
              </PaginationItem>
              <PaginationItem>
                <span className="px-3 text-sm text-muted-foreground">
                  Page {page} of {totalPages}
                </span>
              </PaginationItem>
              <PaginationItem>
                <PaginationNext
                  href="#"
                  className={cn(page >= totalPages && "pointer-events-none opacity-50")}
                  onClick={(e) => {
                    e.preventDefault()
                    if (page < totalPages) setPage((p) => p + 1)
                  }}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      ) : null}

      <ManualEnrollmentDialog open={manualOpen} onOpenChange={setManualOpen} />

      <Dialog
        open={approveTarget != null}
        onOpenChange={(open) => {
          if (!open) {
            setApproveTarget(null)
            setApproveRoll("")
          }
        }}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Approve enrollment</DialogTitle>
            <DialogDescription>
              Enter a roll number for {approveTarget?.name ?? "this student"}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Input
              placeholder="Roll number"
              value={approveRoll}
              onChange={(e) => setApproveRoll(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setApproveTarget(null)}>
              Cancel
            </Button>
            <Button
              type="button"
              disabled={reviewing}
              onClick={() => {
                if (approveTarget) {
                  void handleApprove(approveTarget.id, approveRoll)
                }
              }}
            >
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function OverviewCard({
  label,
  value,
  isLoading,
}: {
  label: string
  value: number | string | undefined
  isLoading: boolean
}) {
  return (
    <div className="rounded-xl border bg-card p-5">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-bold text-foreground">
        {isLoading ? "…" : typeof value === "number" ? (value ?? 0) : (value ?? "৳0")}
      </p>
    </div>
  )
}
