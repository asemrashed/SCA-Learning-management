"use client"

import Link from "next/link"
import { Layers } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useListBatchesQuery } from "@/features/batch/api"
import { ShopOverview } from "@/features/shop/components/shop-overview"
import { LIVE_COURSES, MANAGE_LIVE_COURSES } from "@/lib/product-vocabulary"

export default function AdminDashboardPage() {
  const { data: batchesData, isLoading: batchesLoading } = useListBatchesQuery({
    pageSize: 1,
  })

  const batchTotal = batchesData?.meta.total ?? 0

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground md:text-3xl">Admin</h1>
        <p className="text-muted-foreground">
          Day-to-day — {LIVE_COURSES.toLowerCase()}, shop, content, and enrollments.
        </p>
      </div>

      <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border bg-card p-6">
          <div className="mb-2 flex items-center gap-2 text-muted-foreground">
            <Layers className="h-5 w-5" />
            <span className="text-sm font-medium">{LIVE_COURSES}</span>
          </div>
          <p className="text-3xl font-bold">{batchesLoading ? "…" : batchTotal}</p>
        </div>
      </div>

      <div className="mb-10">
        <ShopOverview showManageLinks />
      </div>

      <div className="flex flex-wrap gap-3">
        <Button asChild variant="outline">
          <Link href="/admin/batches">{MANAGE_LIVE_COURSES}</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/admin/enrollments">Review enrollments</Link>
        </Button>
      </div>
    </div>
  )
}
