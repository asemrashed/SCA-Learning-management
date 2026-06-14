"use client"

import Link from "next/link"
import { Package } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useListOrdersQuery } from "@/features/shop/api"
import { ORDER_STATUS_LABEL } from "@/features/shop/utils"
import { formatBdtMinor } from "@/lib/format-currency"
import { OrderStatus } from "@/types/api"
import { orderWhatsAppMessage, whatsappUrl } from "@/lib/whatsapp"
import { useSelector } from "react-redux"
import type { RootState } from "@/store/rootReducer"

export function OrderList() {
  const userName = useSelector((s: RootState) => s.auth.user?.name)
  const { data, isLoading, error } = useListOrdersQuery()
  const orders = data?.data ?? []

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-8">
        <div className="mb-2 inline-flex items-center gap-2 text-primary">
          <Package className="h-5 w-5" />
          <span className="text-sm font-medium">Shop</span>
        </div>
        <h1 className="text-2xl font-bold">My orders</h1>
        <p className="text-sm text-muted-foreground">Track your study material purchases.</p>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Loading orders…</p>
      ) : error ? (
        <p className="text-destructive">Could not load orders.</p>
      ) : orders.length === 0 ? (
        <div className="rounded-xl border p-8 text-center">
          <p className="text-muted-foreground">You have not placed any orders yet.</p>
          <Button className="mt-4" asChild>
            <Link href="/shop">Browse shop</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="rounded-xl border p-5">
              <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium">Order #{order.id.slice(-8)}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(order.createdAt).toLocaleString("en-BD")}
                  </p>
                </div>
                <Badge variant={order.status === OrderStatus.CONFIRMED ? "default" : "secondary"}>
                  {ORDER_STATUS_LABEL[order.status] ?? order.status}
                </Badge>
              </div>

              <ul className="mb-4 space-y-2 text-sm">
                {order.items.map((item) => (
                  <li key={item.id} className="flex justify-between gap-4">
                    <span>
                      {item.title} × {item.quantity}
                    </span>
                    <span>{formatBdtMinor(item.lineTotalMinor)}</span>
                  </li>
                ))}
              </ul>

              <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
                <p className="font-semibold">Total: {formatBdtMinor(order.totalMinor)}</p>
                {order.status === OrderStatus.PENDING ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      (window.location.href = whatsappUrl(
                        orderWhatsAppMessage(
                          order.id,
                          order.items.map((item) => ({
                            title: item.title,
                            quantity: item.quantity,
                          })),
                          order.totalMinor,
                          userName ?? undefined,
                        ),
                      ))
                    }
                  >
                    Contact admin on WhatsApp
                  </Button>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
