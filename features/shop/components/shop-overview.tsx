"use client"

import Link from "next/link"
import { Package, Plus, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  useListAdminOrderRequestsQuery,
  useListProductsQuery,
} from "@/features/shop/api"
import { OrderStatus } from "@/types/api"

interface ShopOverviewProps {
  showManageLinks?: boolean
}

export function ShopOverview({ showManageLinks = false }: ShopOverviewProps) {
  const { data: productsData, isLoading: productsLoading } = useListProductsQuery({
    pageSize: 1,
  })
  const { data: ordersData, isLoading: ordersLoading } = useListAdminOrderRequestsQuery({
    status: OrderStatus.PENDING,
  })

  const productTotal = productsData?.meta.total ?? 0
  const pendingOrders = ordersData?.data?.length ?? 0

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        Shop
      </h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border bg-card p-6">
          <div className="mb-2 flex items-center gap-2 text-muted-foreground">
            <ShoppingBag className="h-5 w-5" />
            <span className="text-sm font-medium">Products</span>
          </div>
          <p className="text-3xl font-bold">{productsLoading ? "…" : productTotal}</p>
        </div>
        <div className="rounded-xl border bg-card p-6">
          <div className="mb-2 flex items-center gap-2 text-muted-foreground">
            <Package className="h-5 w-5" />
            <span className="text-sm font-medium">Pending orders</span>
          </div>
          <p className="text-3xl font-bold">{ordersLoading ? "…" : pendingOrders}</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-3">
        <Button asChild variant="outline">
          <Link href="/shop">Browse shop</Link>
        </Button>
        {showManageLinks ? (
          <>
            <Button asChild>
              <Link href="/admin/products/new">
                <Plus className="mr-2 h-4 w-4" />
                Add product
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/admin/products">Manage products</Link>
            </Button>
            <Button asChild variant={pendingOrders > 0 ? "default" : "outline"}>
              <Link href="/admin/orders">
                Review orders
                {pendingOrders > 0 ? ` (${pendingOrders})` : ""}
              </Link>
            </Button>
          </>
        ) : null}
      </div>
    </div>
  )
}
