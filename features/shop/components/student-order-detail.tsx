"use client"

import { useState } from "react"
import { BookOpen } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useGetOrderQuery } from "@/features/shop/api"
import { ProductReadModal } from "@/features/shop/components/product-read-modal"
import { ORDER_STATUS_LABEL } from "@/features/shop/utils"
import {
  formatOrderAmount,
  formatOrderDisplayId,
  orderPaymentSummary,
} from "@/features/shop/order-helpers"
import { OrderStatus } from "@/types/api"
import { StudentPageShell } from "@/components/student/student-page-shell"

interface StudentOrderDetailProps {
  orderId: string
}

interface ReadTarget {
  productId: string
  title: string
  priceMinor: number
}

export function StudentOrderDetail({ orderId }: StudentOrderDetailProps) {
  const { data, isLoading, error } = useGetOrderQuery(orderId)
  const order = data?.data
  const [readTarget, setReadTarget] = useState<ReadTarget | null>(null)

  if (isLoading) {
    return (
      <StudentPageShell title="Order Details">
        <p className="text-muted-foreground">Loading order…</p>
      </StudentPageShell>
    )
  }

  if (error || !order) {
    return (
      <StudentPageShell title="Order Details">
        <p className="text-destructive">Order not found.</p>
      </StudentPageShell>
    )
  }

  const { paidMinor, dueMinor } = orderPaymentSummary(order)
  const canRead = order.status === OrderStatus.CONFIRMED

  return (
    <StudentPageShell title="Order Details">
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <h3 className="text-lg font-bold">{formatOrderDisplayId(order.id)}</h3>
        <Badge variant={order.status === OrderStatus.CONFIRMED ? "default" : "secondary"}>
          {ORDER_STATUS_LABEL[order.status] ?? order.status}
        </Badge>
      </div>

      <dl className="mb-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl bg-muted/40 p-4">
          <dt className="text-sm text-muted-foreground">Date</dt>
          <dd className="font-medium">
            {new Date(order.createdAt).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </dd>
        </div>
        <div className="rounded-xl bg-muted/40 p-4">
          <dt className="text-sm text-muted-foreground">Total</dt>
          <dd className="font-medium">{formatOrderAmount(order.totalMinor)}</dd>
        </div>
        <div className="rounded-xl bg-muted/40 p-4">
          <dt className="text-sm text-muted-foreground">Paid</dt>
          <dd className="font-medium">{formatOrderAmount(paidMinor)}</dd>
        </div>
        <div className="rounded-xl bg-muted/40 p-4">
          <dt className="text-sm text-muted-foreground">Due</dt>
          <dd className="font-medium">{formatOrderAmount(dueMinor)}</dd>
        </div>
      </dl>

      <h4 className="mb-3 font-semibold">Items</h4>
      <ul className="divide-y rounded-xl border">
        {order.items.map((item) => (
          <li
            key={item.id}
            className="flex flex-wrap items-center justify-between gap-4 p-4 text-sm"
          >
            <div>
              <p className="font-medium">{item.title}</p>
              <p className="text-muted-foreground">Qty: {item.quantity}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-medium">{formatOrderAmount(item.lineTotalMinor)}</span>
              {canRead ? (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="rounded-lg"
                  onClick={() =>
                    setReadTarget({
                      productId: item.productId,
                      title: item.title,
                      priceMinor: item.unitPriceMinor,
                    })
                  }
                >
                  <BookOpen className="mr-1 h-4 w-4" />
                  Read
                </Button>
              ) : null}
            </div>
          </li>
        ))}
      </ul>

      <ProductReadModal
        open={readTarget != null}
        onOpenChange={(open) => {
          if (!open) setReadTarget(null)
        }}
        productId={readTarget?.productId ?? ""}
        title={readTarget?.title ?? ""}
        priceMinor={readTarget?.priceMinor ?? 0}
        purchased
      />
    </StudentPageShell>
  )
}
