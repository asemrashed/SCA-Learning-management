"use client"

import Link from "next/link"
import { Package, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useListOrdersQuery } from "@/features/shop/api"
import { OrderStatus } from "@/types/api"

export function StudentShopOverview() {
  const { data, isLoading } = useListOrdersQuery()
  const orders = data?.data ?? []
  const pendingCount = orders.filter((o) => o.status === OrderStatus.PENDING).length

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        Shop
      </h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border bg-card p-6">
          <div className="mb-2 flex items-center gap-2 text-muted-foreground">
            <ShoppingBag className="h-5 w-5" />
            <span className="text-sm font-medium">My orders</span>
          </div>
          <p className="text-3xl font-bold">{isLoading ? "…" : orders.length}</p>
        </div>
        <div className="rounded-xl border bg-card p-6">
          <div className="mb-2 flex items-center gap-2 text-muted-foreground">
            <Package className="h-5 w-5" />
            <span className="text-sm font-medium">Awaiting confirmation</span>
          </div>
          <p className="text-3xl font-bold">{isLoading ? "…" : pendingCount}</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-3">
        <Button asChild>
          <Link href="/shop">Browse shop</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/dashboard/orders">My orders</Link>
        </Button>
      </div>
    </div>
  )
}
