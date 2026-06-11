"use client"

import Link from "next/link"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatBdtMinor } from "@/lib/format-currency"
import { useListCoursesQuery, useDeleteCourseMutation } from "@/features/course/api"

export default function AdminCoursesPage() {
  const { data, isLoading, error } = useListCoursesQuery({ pageSize: 50, sort: "createdAt:desc" })
  const [deleteCourse] = useDeleteCourseMutation()

  const courses = data?.data ?? []

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Manage courses</h1>
          <p className="text-sm text-muted-foreground">Create and edit self-paced courses</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/admin/batches">Batches</Link>
          </Button>
          <Button asChild>
            <Link href="/admin/courses/new">
              <Plus className="mr-2 h-4 w-4" />
              New course
            </Link>
          </Button>
        </div>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : error ? (
        <p className="text-destructive">Could not load courses. Sign in as admin or instructor.</p>
      ) : courses.length === 0 ? (
        <p className="text-muted-foreground">No courses yet.</p>
      ) : (
        <div className="overflow-hidden rounded-xl border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Title</th>
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
                    {course.priceMinor === 0 ? "Free" : formatBdtMinor(course.priceMinor)}
                  </td>
                  <td className="px-4 py-3">
                    {course.isPublished ? "Published" : "Draft"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/admin/courses/${course.id}/edit`}>Edit</Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                        onClick={() => {
                          if (confirm("Delete this course?")) {
                            void deleteCourse(course.id)
                          }
                        }}
                      >
                        Delete
                      </Button>
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
