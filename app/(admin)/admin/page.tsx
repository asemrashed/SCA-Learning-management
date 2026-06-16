"use client"

import Link from "next/link"
import { Layers } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useListCoursesQuery } from "@/features/course/api"
import { ShopOverview } from "@/features/shop/components/shop-overview"
import { COURSES, MANAGE_COURSES } from "@/lib/product-vocabulary"

export default function AdminDashboardPage() {
  const { data: coursesData, isLoading: coursesLoading } = useListCoursesQuery({
    pageSize: 1,
  })

  const courseTotal = coursesData?.meta.total ?? 0

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground md:text-3xl">Admin</h1>
        <p className="text-muted-foreground">
          Day-to-day — courses, batches, shop, content, and enrollments.
        </p>
      </div>

      <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border bg-card p-6">
          <div className="mb-2 flex items-center gap-2 text-muted-foreground">
            <Layers className="h-5 w-5" />
            <span className="text-sm font-medium">{COURSES}</span>
          </div>
          <p className="text-3xl font-bold">{coursesLoading ? "…" : courseTotal}</p>
        </div>
      </div>

      <div className="mb-10">
        <ShopOverview showManageLinks />
      </div>

      <div className="flex flex-wrap gap-3">
        <Button asChild variant="outline">
          <Link href="/admin/courses">{MANAGE_COURSES}</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/admin/enrollments">Review enrollments</Link>
        </Button>
      </div>
    </div>
  )
}
