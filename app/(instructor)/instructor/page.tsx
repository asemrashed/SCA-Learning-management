"use client"

import Link from "next/link"
import { Layers, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useListBatchesQuery } from "@/features/batch/api"
import { StudentShopOverview } from "@/features/shop/components/student-shop-overview"
import {
  BROWSE_LIVE_COURSES,
  LIVE_COURSE_CATALOG_HREF,
  LIVE_COURSES,
  MY_LIVE_COURSES,
} from "@/lib/product-vocabulary"

export default function InstructorDashboardPage() {
  const { data: batchesData, isLoading: batchesLoading } = useListBatchesQuery({
    pageSize: 1,
  })

  const batchTotal = batchesData?.meta.total ?? 0

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground md:text-3xl">Instructor overview</h1>
        <p className="text-muted-foreground">
          {LIVE_COURSES} you are assigned to teach, plus the study-material shop.
        </p>
      </div>

      <div className="mb-10 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border bg-card p-6">
          <div className="mb-2 flex items-center gap-2 text-muted-foreground">
            <Layers className="h-5 w-5" />
            <span className="text-sm font-medium">{LIVE_COURSES}</span>
          </div>
          <p className="text-3xl font-bold">{batchesLoading ? "…" : batchTotal}</p>
        </div>
        <div className="rounded-xl border bg-card p-6">
          <div className="mb-2 flex items-center gap-2 text-muted-foreground">
            <ShoppingBag className="h-5 w-5" />
            <span className="text-sm font-medium">Shop</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Buy books and notes like a student, or open student view for order history.
          </p>
        </div>
      </div>

      <div className="mb-10">
        <StudentShopOverview />
      </div>

      <div className="flex flex-wrap gap-3">
        <Button asChild variant="outline">
          <Link href="/instructor/batches">{MY_LIVE_COURSES}</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href={LIVE_COURSE_CATALOG_HREF}>{BROWSE_LIVE_COURSES}</Link>
        </Button>
      </div>
    </div>
  )
}
