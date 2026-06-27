"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Plus, Search } from "lucide-react"
import { useSelector } from "react-redux"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { formatBdtMinor } from "@/lib/format-currency"
import { isSuperAdmin } from "@/lib/roles"
import type { RootState } from "@/store"
import { useListBatchesQuery, useDeleteBatchMutation } from "@/features/batch/api"
import type { BatchStatus } from "@/features/batch/types"
import { BATCH_STATUS_LABEL } from "@/features/batch/utils"
import { useListCoursesQuery } from "@/features/course/api"
import { useListCategoriesQuery } from "@/features/category/api"
import { BATCH, BATCHES } from "@/lib/product-vocabulary"
import { DeliveryMode } from "@/types/api"
import { DashboardTable } from "@/components/dashboard-table"
import { TableRowActions } from "@/components/table-row-actions"

const BATCH_BASE = "/admin/batches"

const BATCH_STATUSES: BatchStatus[] = [
  "DRAFT",
  "UPCOMING",
  "ACTIVE",
  "COMPLETED",
  "CANCELLED",
]

function batchYear(startDate: string | null): string | null {
  if (!startDate) return null
  return String(new Date(startDate).getFullYear())
}

export function BatchManageList() {
  const user = useSelector((state: RootState) => state.auth.user)
  const canCreateDelete = user?.role !== undefined && isSuperAdmin(user.role)

  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [courseFilter, setCourseFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [yearFilter, setYearFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 300)
    return () => clearTimeout(timer)
  }, [search])

  const { data: coursesData } = useListCoursesQuery({
    pageSize: 100,
    deliveryMode: DeliveryMode.LIVE,
    sort: "title:asc",
  })
  const { data: categoriesData } = useListCategoriesQuery({ pageSize: 100, sort: "order:asc" })

  const liveCourses = coursesData?.data ?? []
  const categories = categoriesData?.data ?? []

  const { data: allBatchesData } = useListBatchesQuery({
    pageSize: 100,
    sort: "startDate:desc",
  })

  const { data, isLoading, error } = useListBatchesQuery({
    pageSize: 100,
    sort: "createdAt:desc",
    search: debouncedSearch || undefined,
    courseId: courseFilter !== "all" ? courseFilter : undefined,
    categoryId: categoryFilter !== "all" ? categoryFilter : undefined,
    year: yearFilter !== "all" ? Number(yearFilter) : undefined,
    status: statusFilter !== "all" ? (statusFilter as BatchStatus) : undefined,
  })
  const [deleteBatch] = useDeleteBatchMutation()

  const batches = data?.data ?? []

  const yearOptions = useMemo(() => {
    const years = new Set<string>()
    for (const batch of allBatchesData?.data ?? []) {
      const y = batchYear(batch.startDate)
      if (y) years.add(y)
    }
    return Array.from(years).sort((a, b) => Number(b) - Number(a))
  }, [allBatchesData])

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{BATCHES}</h1>
          <p className="text-sm text-muted-foreground">
            Yearly cohorts under live courses — schedule, price, and live sessions
          </p>
        </div>
        {canCreateDelete ? (
          <Button asChild variant="outline">
            <Link href="/admin/courses">
              <Plus className="mr-2 h-4 w-4" />
              Add via course
            </Link>
          </Button>
        ) : null}
      </div>

      <div className="mb-6 space-y-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={`Search ${BATCHES.toLowerCase()}…`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-3">
          <Select value={courseFilter} onValueChange={setCourseFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Course" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All courses</SelectItem>
              {liveCourses.map((course) => (
                <SelectItem key={course.id} value={course.id}>
                  {course.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={yearFilter} onValueChange={setYearFilter}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All years</SelectItem>
              {yearOptions.map((year) => (
                <SelectItem key={year} value={year}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {BATCH_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {BATCH_STATUS_LABEL[s] ?? s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : error ? (
        <p className="text-destructive">Could not load {BATCHES.toLowerCase()}.</p>
      ) : batches.length === 0 ? (
        <p className="text-muted-foreground">No {BATCHES.toLowerCase()} match your filters.</p>
      ) : (
        <DashboardTable>
          <table className="w-full min-w-[900px] text-sm">
            <thead className="bg-muted/50 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Cohort</th>
                <th className="px-4 py-3 font-medium">Course</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Year</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {batches.map((batch) => (
                <tr key={batch.id} className="border-t">
                  <td className="px-4 py-3">
                    <div className="font-medium">{batch.title}</div>
                    <div className="text-xs text-muted-foreground">{batch.slug}</div>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/courses/${batch.courseId}`}
                      className="text-primary hover:underline"
                    >
                      {batch.courseTitle ?? "View course"}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {batch.courseCategory ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {batchYear(batch.startDate) ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    {batch.priceMinor === 0 ? "Free" : formatBdtMinor(batch.priceMinor)}
                  </td>
                  <td className="px-4 py-3">
                    {BATCH_STATUS_LABEL[batch.status] ?? batch.status}
                  </td>
                  <td className="px-4 py-3">
                    <TableRowActions
                      actions={[
                        { label: "Edit", href: `${BATCH_BASE}/${batch.id}/edit` },
                        { label: "View", href: `${BATCH_BASE}/${batch.id}` },
                        { label: "Live", href: `${BATCH_BASE}/${batch.id}/live` },
                        {
                          label: "Delete",
                          destructive: true,
                          hidden: !canCreateDelete,
                          onClick: () => {
                            if (confirm(`Delete this ${BATCH.toLowerCase()}?`)) {
                              void deleteBatch(batch.id)
                            }
                          },
                        },
                      ]}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </DashboardTable>
      )}
    </div>
  )
}
