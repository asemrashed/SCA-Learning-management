"use client"

import Link from "next/link"
import { Plus } from "lucide-react"
import { useSelector } from "react-redux"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatBdtMinor } from "@/lib/format-currency"
import { isSuperAdmin } from "@/lib/roles"
import type { RootState } from "@/store"
import { useListCoursesQuery, useDeleteCourseMutation } from "@/features/course/api"
import { COURSES, MANAGE_COURSES, NEW_COURSE, deliveryModeLabel } from "@/lib/product-vocabulary"
import { DeliveryMode } from "@/types/api"

export function CourseManageList() {
  const user = useSelector((state: RootState) => state.auth.user)
  const canCreateDelete = user?.role !== undefined && isSuperAdmin(user.role)

  const { data, isLoading, error } = useListCoursesQuery({
    pageSize: 50,
    sort: "createdAt:desc",
  })
  const [deleteCourse] = useDeleteCourseMutation()

  const courses = data?.data ?? []

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
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

      {isLoading ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : error ? (
        <p className="text-destructive">Could not load {COURSES.toLowerCase()}.</p>
      ) : courses.length === 0 ? (
        <p className="text-muted-foreground">No {COURSES.toLowerCase()} yet.</p>
      ) : (
        <div className="overflow-hidden rounded-xl border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Mode</th>
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
                  <td className="px-4 py-3">
                    {course.priceMinor === 0 ? "Free" : formatBdtMinor(course.priceMinor)}
                  </td>
                  <td className="px-4 py-3">
                    {course.isPublished ? "Published" : "Draft"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/admin/courses/${course.id}/edit`}>Edit</Link>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/admin/courses/${course.id}`}>View</Link>
                      </Button>
                      {canCreateDelete ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive"
                          onClick={() => {
                            if (confirm(`Delete this course?`)) {
                              void deleteCourse(course.id)
                            }
                          }}
                        >
                          Delete
                        </Button>
                      ) : null}
                    </div>
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
