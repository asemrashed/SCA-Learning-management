"use client"

import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { useGetEnrollmentQuery } from "@/features/enrollment/api"
import { enrollmentProductId, enrollmentProductTitle } from "@/features/enrollment/curriculum"
import { useListOrdersQuery } from "@/features/shop/api"
import { ORDER_STATUS_LABEL } from "@/features/shop/utils"
import {
  formatOrderAmount,
  formatOrderDisplayId,
  orderPaymentSummary,
} from "@/features/shop/order-helpers"
import { StudentPageShell } from "@/components/student/student-page-shell"
import { EnrollmentKind, OrderStatus } from "@/types/api"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

function formatOrderDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

export function CoursePaymentHistory({ enrollmentId }: { enrollmentId: string }) {
  const { data: enrollmentData, isLoading: enrollmentLoading } =
    useGetEnrollmentQuery(enrollmentId)
  const { data: ordersData, isLoading: ordersLoading, error } = useListOrdersQuery()

  const enrollment = enrollmentData?.data
  const productId = enrollment ? enrollmentProductId(enrollment) : ""
  const productTitle = enrollment ? enrollmentProductTitle(enrollment) : ""

  const orders = (ordersData?.data ?? []).filter((order) =>
    order.items.some(
      (item) =>
        item.productId === productId ||
        item.title.toLowerCase() === productTitle.toLowerCase(),
    ),
  )

  if (enrollmentLoading || ordersLoading) {
    return (
      <StudentPageShell title="Payment History">
        <p className="text-muted-foreground">Loading…</p>
      </StudentPageShell>
    )
  }

  if (!enrollment) {
    return (
      <StudentPageShell title="Payment History">
        <p className="text-destructive">Course not found.</p>
      </StudentPageShell>
    )
  }

  return (
    <StudentPageShell title={productTitle}>
      <h1 className="mb-6 text-2xl font-bold">Payment History</h1>

      {error ? (
        <p className="text-destructive">Could not load payment history.</p>
      ) : orders.length === 0 ? (
        <div className="rounded-xl border border-dashed p-8 text-center">
          <p className="mb-2 text-sm text-muted-foreground">
            No payment records found for this course.
          </p>
          <Link href="/dashboard/orders" className="text-sm font-medium text-primary hover:underline">
            View all orders
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/60 hover:bg-muted/60">
                <TableHead>Order</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Paid</TableHead>
                <TableHead className="text-right">Due</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order, index) => {
                const { paidMinor, dueMinor } = orderPaymentSummary(order)
                return (
                  <TableRow
                    key={order.id}
                    className={index % 2 === 1 ? "bg-muted/20" : undefined}
                  >
                    <TableCell>
                      <Link
                        href={`/dashboard/orders/${order.id}`}
                        className="font-medium text-primary hover:underline"
                      >
                        {formatOrderDisplayId(order.id)}
                      </Link>
                    </TableCell>
                    <TableCell>{formatOrderDate(order.createdAt)}</TableCell>
                    <TableCell>
                      <Badge
                        variant={order.status === OrderStatus.CONFIRMED ? "default" : "secondary"}
                      >
                        {ORDER_STATUS_LABEL[order.status] ?? order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">{formatOrderAmount(order.totalMinor)}</TableCell>
                    <TableCell className="text-right">{formatOrderAmount(paidMinor)}</TableCell>
                    <TableCell className="text-right">{formatOrderAmount(dueMinor)}</TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {enrollment.kind === EnrollmentKind.BATCH && enrollment.status ? (
        <p className="mt-4 text-sm text-muted-foreground">
          Enrollment status: <span className="font-medium text-foreground">{enrollment.status}</span>
        </p>
      ) : null}
    </StudentPageShell>
  )
}
