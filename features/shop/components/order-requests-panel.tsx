"use client"

import { useState } from "react"
import { Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  useListAdminOrderRequestsQuery,
  useReviewOrderRequestMutation,
} from "@/features/shop/api"
import { ORDER_STATUS_LABEL } from "@/features/shop/utils"
import { formatBdtMinor } from "@/lib/format-currency"
import { OrderStatus } from "@/types/api"

export function OrderRequestsPanel() {
  const { data, isLoading, error } = useListAdminOrderRequestsQuery({
    status: OrderStatus.PENDING,
  })
  const [reviewOrder, { isLoading: reviewing }] = useReviewOrderRequestMutation()
  const [actionError, setActionError] = useState<string | null>(null)

  const requests = data?.data ?? []

  async function handleConfirm(id: string) {
    setActionError(null)
    try {
      await reviewOrder({ id, body: { action: "confirm" } }).unwrap()
    } catch {
      setActionError("Could not confirm order. Check stock and try again.")
    }
  }

  async function handleCancel(id: string) {
    setActionError(null)
    try {
      await reviewOrder({ id, body: { action: "cancel" } }).unwrap()
    } catch {
      setActionError("Could not cancel order.")
    }
  }

  if (isLoading) {
    return <p className="text-muted-foreground">Loading order requests…</p>
  }

  if (error) {
    return <p className="text-destructive">Could not load order requests.</p>
  }

  if (requests.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-10 text-center text-muted-foreground">
        No pending shop orders. Students place orders from the shop, then pay via WhatsApp.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {actionError ? <p className="text-sm text-destructive">{actionError}</p> : null}
      {requests.map((order) => (
        <div key={order.id} className="rounded-xl border bg-card p-5">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <Badge variant="secondary">Shop order</Badge>
                <Badge>{ORDER_STATUS_LABEL[order.status] ?? order.status}</Badge>
              </div>
              <p className="text-lg font-semibold">Order #{order.id.slice(-8)}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {order.student.name} · {order.student.phone}
              </p>
              <p className="text-xs text-muted-foreground">
                Placed {new Date(order.createdAt).toLocaleString()}
              </p>
            </div>
            <p className="text-xl font-bold text-primary">{formatBdtMinor(order.totalMinor)}</p>
          </div>

          <ul className="mb-4 space-y-1 text-sm">
            {order.items.map((item) => (
              <li key={item.id} className="flex justify-between gap-4">
                <span>
                  {item.title} × {item.quantity}
                </span>
                <span>{formatBdtMinor(item.lineTotalMinor)}</span>
              </li>
            ))}
          </ul>

          <div className="flex flex-wrap gap-2">
            <Button disabled={reviewing} onClick={() => void handleConfirm(order.id)}>
              <Check className="mr-2 h-4 w-4" />
              Confirm sale
            </Button>
            <Button
              variant="outline"
              disabled={reviewing}
              onClick={() => void handleCancel(order.id)}
            >
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}
