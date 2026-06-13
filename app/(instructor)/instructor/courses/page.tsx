"use client"

import Link from "next/link"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatBdtMinor } from "@/lib/format-currency"
import { useListCoursesQuery } from "@/features/course/api"

export default function InstructorCoursesPage() {
  const { data, isLoading, error } = useListCoursesQuery({ pageSize: 50, sort: "createdAt:desc" })
  const courses = data?.data ?? []

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground md:text-3xl">My courses</h1>
          <p className="text-muted-foreground">Create and edit self-paced courses.</p>
        </div>
        <Button asChild>
          <Link href="/admin/courses/new">
            <Plus className="mr-2 h-4 w-4" />
            New course
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Loading courses…</p>
      ) : error ? (
        <p className="text-destructive">Could not load courses.</p>
      ) : courses.length === 0 ? (
        <p className="text-muted-foreground">No courses yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Published</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {courses.map((course) => (
                <tr key={course.id} className="border-b last:border-0">
                  <td className="px-4 py-3 font-medium">{course.title}</td>
                  <td className="px-4 py-3">{course.isPublished ? "Yes" : "Draft"}</td>
                  <td className="px-4 py-3">{formatBdtMinor(course.priceMinor)}</td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="outline" size="sm" asChild className="mr-2">
                      <Link href={`/instructor/courses/${course.id}`}>View</Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/admin/courses/${course.id}/edit`}>Edit</Link>
                    </Button>
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
