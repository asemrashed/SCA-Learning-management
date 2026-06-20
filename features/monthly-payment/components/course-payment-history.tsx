"use client"

import { useState } from "react"
import Link from "next/link"
import { MessageCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  useGetEnrollmentPaymentHistoryQuery,
  useRequestMonthlyPaymentMutation,
} from "@/features/monthly-payment/api"
import { formatBdtMinor } from "@/lib/format-currency"
import { StudentPageShell } from "@/components/student/student-page-shell"
import { MonthlyPaymentStatus } from "@/types/api"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

function formatDeadline(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

function formatBillingMonth(billingMonth: string): string {
  const [year, month] = billingMonth.split("-")
  const date = new Date(Number(year), Number(month) - 1, 1)
  return date.toLocaleDateString("en-GB", { month: "long", year: "numeric" })
}

function historyLabel(item: {
  type: "MONTHLY" | "ENROLLMENT"
  billingMonth: string | null
}): string {
  if (item.type === "ENROLLMENT") return "Enrollment fee"
  return item.billingMonth ? formatBillingMonth(item.billingMonth) : "Monthly fee"
}

function enrollmentTitle(enrollment: {
  courseTitle: string
  batchTitle: string | null
}): string {
  return enrollment.batchTitle
    ? `${enrollment.courseTitle} · ${enrollment.batchTitle}`
    : enrollment.courseTitle
}

export function CoursePaymentHistory({ enrollmentId }: { enrollmentId: string }) {
  const { data: historyData, isLoading: historyLoading, error } =
    useGetEnrollmentPaymentHistoryQuery(enrollmentId)
  const [requestPayment, { isLoading: requesting }] = useRequestMonthlyPaymentMutation()
  const [actionError, setActionError] = useState<string | null>(null)

  const history = historyData?.data
  const productTitle = history ? enrollmentTitle(history.enrollment) : ""

  async function handlePayThisMonth() {
    setActionError(null)
    try {
      const result = await requestPayment(enrollmentId).unwrap()
      window.open(result.data.whatsappUrl, "_blank", "noopener,noreferrer")
    } catch {
      setActionError("Could not submit payment request. Please try again.")
    }
  }

  if (historyLoading) {
    return (
      <StudentPageShell title="Payment History">
        <p className="text-muted-foreground">Loading…</p>
      </StudentPageShell>
    )
  }

  if (!history) {
    return (
      <StudentPageShell title="Payment History">
        <p className="text-destructive">Could not load payment history.</p>
      </StudentPageShell>
    )
  }

  const currentRequest = history.currentMonthRequest
  const showPayButton =
    history.canRequestCurrentMonth ||
    currentRequest?.status === MonthlyPaymentStatus.REQUESTED

  return (
    <StudentPageShell title={productTitle}>
      <h1 className="mb-6 text-2xl font-bold">Payment History</h1>

      <div className="mb-6 rounded-xl border bg-card p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Current billing period</p>
            <p className="text-lg font-semibold">
              {formatBillingMonth(history.currentBillingMonth)}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Payment deadline:{" "}
              <span className="font-medium text-foreground">
                {formatDeadline(history.paymentDeadline)}
              </span>
            </p>
            {history.isAccessBlocked ? (
              <p className="mt-2 text-sm font-medium text-destructive">
                Course access is blocked until this month&apos;s fee is paid and approved.
              </p>
            ) : history.isPastDeadline ? null : !history.isCurrentMonthPaid ? (
              <p className="mt-2 text-sm text-amber-700">
                Pay by the deadline to keep uninterrupted course access.
              </p>
            ) : null}
            {currentRequest?.status === MonthlyPaymentStatus.REQUESTED ? (
              <p className="mt-1 text-sm text-amber-700">
                Payment request sent — waiting for admin approval.
              </p>
            ) : currentRequest?.status === MonthlyPaymentStatus.APPROVED ? (
              <p className="mt-1 text-sm text-emerald-700">
                This month&apos;s fee is paid.
              </p>
            ) : currentRequest?.status === MonthlyPaymentStatus.REJECTED ? (
              <p className="mt-1 text-sm text-destructive">
                Last request was rejected. You can submit again.
              </p>
            ) : null}
          </div>
          {showPayButton ? (
            <Button
              onClick={handlePayThisMonth}
              disabled={requesting}
              className="gap-2"
            >
              <MessageCircle className="h-4 w-4" />
              {requesting ? "Submitting…" : "Pay this month's fee"}
            </Button>
          ) : null}
        </div>
        {actionError ? <p className="mt-3 text-sm text-destructive">{actionError}</p> : null}
        <p className="mt-3 text-xs text-muted-foreground">
          Tap the button to send a payment request and open WhatsApp to contact the admin.
        </p>
      </div>

      {error ? (
        <p className="text-destructive">Could not load payment history.</p>
      ) : history.history.length === 0 ? (
        <div className="rounded-xl border border-dashed p-8 text-center">
          <p className="mb-2 text-sm text-muted-foreground">
            No payment records yet for this course.
          </p>
          <Link href="/dashboard/orders" className="text-sm font-medium text-primary hover:underline">
            View shop orders
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/60 hover:bg-muted/60">
                <TableHead>Description</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.history.map((item, index) => (
                <TableRow
                  key={`${item.type}-${item.id}`}
                  className={index % 2 === 1 ? "bg-muted/20" : undefined}
                >
                  <TableCell className="font-medium">{historyLabel(item)}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {item.type === "ENROLLMENT" ? "Enrollment" : "Monthly"}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(item.paidAt ?? item.createdAt)}</TableCell>
                  <TableCell>
                    <Badge variant={item.status === "APPROVED" || item.status === "PAID" ? "default" : "secondary"}>
                      {item.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">{formatBdtMinor(item.amountMinor)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <p className="mt-4 text-sm text-muted-foreground">
        Enrollment:{" "}
        <span className="font-medium text-foreground">
          {history.enrollment.courseTitle}
          {history.enrollment.batchTitle ? ` · ${history.enrollment.batchTitle}` : ""}
        </span>
        {history.enrollment.rollNumber ? (
          <>
            {" "}
            · Roll <span className="font-medium text-foreground">{history.enrollment.rollNumber}</span>
          </>
        ) : null}
      </p>
    </StudentPageShell>
  )
}
