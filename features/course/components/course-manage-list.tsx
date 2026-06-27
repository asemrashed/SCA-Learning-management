"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Plus, Search } from "lucide-react"
import { useSelector } from "react-redux"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
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
import { useListCoursesQuery, useDeleteCourseMutation } from "@/features/course/api"
import { useListCategoriesQuery } from "@/features/category/api"
import { COURSES, MANAGE_COURSES, NEW_COURSE, deliveryModeLabel } from "@/lib/product-vocabulary"
import { DeliveryMode } from "@/types/api"
import { cn } from "@/lib/utils"
import { DashboardTable } from "@/components/dashboard-table"
import { TableRowActions } from "@/components/table-row-actions"

type ModeFilter = "all" | DeliveryMode.LIVE | DeliveryMode.RECORDED

export function CourseManageList() {
  const user = useSelector((state: RootState) => state.auth.user)
  const canCreateDelete = user?.role !== undefined && isSuperAdmin(user.role)

  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [modeFilter, setModeFilter] = useState<ModeFilter>("all")
  const [categoryFilter, setCategoryFilter] = useState("all")

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 300)
    return () => clearTimeout(timer)
  }, [search])

  const { data: categoriesData } = useListCategoriesQuery({ pageSize: 100, sort: "order:asc" })
  const categories = categoriesData?.data ?? []

  const { data, isLoading, error } = useListCoursesQuery({
    pageSize: 100,
    sort: "createdAt:desc",
    search: debouncedSearch || undefined,
    deliveryMode: modeFilter !== "all" ? modeFilter : undefined,
    category:
      categoryFilter !== "all"
        ? categories.find((c) => c.id === categoryFilter)?.slug
        : undefined,
  })
  const [deleteCourse] = useDeleteCourseMutation()

  const courses = data?.data ?? []

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{MANAGE_COURSES}</h1>
          <p className="text-sm text-muted-foreground">
            Unified {COURSES.toLowerCase()} — live (subjects + batches) and recorded (chapters)
          </p>
        </div>
        {canCreateDelete ? (
          <Button asChild>
            <Link href="/admin/courses/new">
              <Plus className="mr-2 h-4 w-4" />
              {NEW_COURSE}
            </Link>
          </Button>
        ) : null}
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        <Button
          type="button"
          variant={modeFilter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setModeFilter("all")}
        >
          All courses
        </Button>
        <Button
          type="button"
          variant={modeFilter === DeliveryMode.LIVE ? "default" : "outline"}
          size="sm"
          onClick={() => setModeFilter(DeliveryMode.LIVE)}
        >
          {deliveryModeLabel(DeliveryMode.LIVE)} courses
        </Button>
        <Button
          type="button"
          variant={modeFilter === DeliveryMode.RECORDED ? "default" : "outline"}
          size="sm"
          onClick={() => setModeFilter(DeliveryMode.RECORDED)}
        >
          {deliveryModeLabel(DeliveryMode.RECORDED)} courses
        </Button>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[200px] flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search courses…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className={cn("w-[180px]")}>
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
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : error ? (
        <p className="text-destructive">Could not load {COURSES.toLowerCase()}.</p>
      ) : courses.length === 0 ? (
        <p className="text-muted-foreground">No {COURSES.toLowerCase()} match your filters.</p>
      ) : (
        <DashboardTable>
          <table className="w-full min-w-[800px] text-sm">
            <thead className="bg-muted/50 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Mode</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course) => (
                <tr key={course.id} className="border-t">
                  <td className="px-4 py-3">
                    <div className="font-medium">{course.title}</div>
                    <div className="text-xs text-muted-foreground">{course.slug}</div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="outline">{deliveryModeLabel(course.deliveryMode)}</Badge>
                    {course.deliveryMode === DeliveryMode.LIVE && course.batchCount != null ? (
                      <span className="ml-2 text-xs text-muted-foreground">
                        {course.batchCount} batch{course.batchCount === 1 ? "" : "es"}
                      </span>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {course.category ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    {course.deliveryMode === DeliveryMode.LIVE ? (
                      <span className="text-muted-foreground">Per batch</span>
                    ) : course.priceMinor === 0 ? (
                      "Free"
                    ) : (
                      formatBdtMinor(course.priceMinor)
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {course.isPublished ? "Published" : "Draft"}
                  </td>
                  <td className="px-4 py-3">
                    <TableRowActions
                      actions={[
                        { label: "Edit", href: `/admin/courses/${course.id}/edit` },
                        { label: "View", href: `/admin/courses/${course.id}` },
                        {
                          label: "Delete",
                          destructive: true,
                          hidden: !canCreateDelete,
                          onClick: () => {
                            if (confirm(`Delete this course?`)) {
                              void deleteCourse(course.id)
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
