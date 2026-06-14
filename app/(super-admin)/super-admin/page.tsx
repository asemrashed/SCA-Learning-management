"use client"

import Link from "next/link"
import { ClipboardList, FileText, Layers, Plus, UserPlus, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useListBatchesQuery } from "@/features/batch/api"
import { ShopOverview } from "@/features/shop/components/shop-overview"
import { LIVE_COURSES, MANAGE_LIVE_COURSES, NEW_LIVE_COURSE } from "@/lib/product-vocabulary"

export default function SuperAdminDashboardPage() {
  const { data: batchesData, isLoading: batchesLoading } = useListBatchesQuery({
    pageSize: 1,
  })

  const batchTotal = batchesData?.meta.total ?? 0

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground md:text-3xl">Super admin</h1>
        <p className="text-muted-foreground">
          Platform owner — {LIVE_COURSES.toLowerCase()}, shop, admins, and all staff tools.
        </p>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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

      <div className="mb-10">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Platform
        </h2>
        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/admin/batches/new">
              <Plus className="mr-2 h-4 w-4" />
              {NEW_LIVE_COURSE}
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/admin/batches">{MANAGE_LIVE_COURSES}</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/super-admin/users">
              <Users className="mr-2 h-4 w-4" />
              Manage admins
            </Link>
          </Button>
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Admin tools
        </h2>
        <div className="flex flex-wrap gap-3">
          <Button asChild variant="outline">
            <Link href="/admin/enrollments">
              <UserPlus className="mr-2 h-4 w-4" />
              Enrollments
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/admin/orders">Shop orders</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/admin/products">Shop products</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/admin/resources">
              <FileText className="mr-2 h-4 w-4" />
              Resources
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/admin/exams">
              <ClipboardList className="mr-2 h-4 w-4" />
              Exams
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/admin/assignments">Assignments</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/admin/questions">Question bank</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/admin/certificates">Certificates</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
