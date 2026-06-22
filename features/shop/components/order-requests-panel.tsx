"use client"

import { useState } from "react"
import { Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  useListAdminOrderRequestsQuery,
  useReviewOrderRequestMutation,
} from "@/features/shop/api"
import { ORDER_STATUS_LABEL } from "@/features/shop/utils"
import { formatBdtMinor } from "@/lib/format-currency"
import { OrderStatus } from "@/types/api"

type StatusFilter = OrderStatus | "ALL"

export function OrderRequestsPanel() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(OrderStatus.PENDING)
  const { data, isLoading, error } = useListAdminOrderRequestsQuery({
    status: statusFilter === "ALL" ? undefined : statusFilter,
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

  return (
    <div className="space-y-4">
      <Select
        value={statusFilter}
        onValueChange={(value) => setStatusFilter(value as StatusFilter)}
      >
        <SelectTrigger className="w-full sm:w-[220px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={OrderStatus.PENDING}>Pending</SelectItem>
          <SelectItem value={OrderStatus.CONFIRMED}>Confirmed</SelectItem>
          <SelectItem value={OrderStatus.CANCELLED}>Cancelled</SelectItem>
          <SelectItem value="ALL">All</SelectItem>
        </SelectContent>
      </Select>

      {actionError ? <p className="text-sm text-destructive">{actionError}</p> : null}

      {isLoading ? (
        <p className="text-muted-foreground">Loading order requests…</p>
      ) : error ? (
        <p className="text-destructive">Could not load order requests.</p>
      ) : requests.length === 0 ? (
        <div className="rounded-xl border border-dashed p-10 text-center text-muted-foreground">
          No shop orders match your filters.
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Order</th>
                <th className="px-4 py-3 font-medium">Student</th>
                <th className="px-4 py-3 font-medium">Items</th>
                <th className="px-4 py-3 font-medium">Total</th>
                <th className="px-4 py-3 font-medium">Placed</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((order) => (
                <tr key={order.id} className="border-t">
                  <td className="px-4 py-3 font-medium">#{order.id.slice(-8)}</td>
                  <td className="px-4 py-3">
                    <div>{order.student.name}</div>
                    <div className="text-xs text-muted-foreground">{order.student.phone}</div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    <ul className="space-y-0.5">
                      {order.items.map((item) => (
                        <li key={item.id}>
                          {item.title} × {item.quantity}
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td className="px-4 py-3 font-medium text-primary">
                    {formatBdtMinor(order.totalMinor)}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(order.createdAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <Badge>{ORDER_STATUS_LABEL[order.status] ?? order.status}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    {order.status === OrderStatus.PENDING ? (
                      <div className="flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          disabled={reviewing}
                          onClick={() => void handleConfirm(order.id)}
                        >
                          <Check className="mr-1 h-4 w-4" />
                          Confirm
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={reviewing}
                          onClick={() => void handleCancel(order.id)}
                        >
                          <X className="mr-1 h-4 w-4" />
                          Cancel
                        </Button>
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
    </div>
  )
}
