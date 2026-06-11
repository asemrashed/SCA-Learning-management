"use client"

import Link from "next/link"
import { BookOpen, Layers, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useListCoursesQuery } from "@/features/course/api"
import { useListBatchesQuery } from "@/features/batch/api"

export default function InstructorDashboardPage() {
  const { data: coursesData, isLoading: coursesLoading } = useListCoursesQuery({
    pageSize: 1,
  })
  const { data: batchesData, isLoading: batchesLoading } = useListBatchesQuery({
    pageSize: 1,
  })

  const courseTotal = coursesData?.meta.total ?? 0
  const batchTotal = batchesData?.meta.total ?? 0

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground md:text-3xl">Instructor overview</h1>
        <p className="text-muted-foreground">
          Courses you can edit and batches you are assigned to teach.
        </p>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border bg-card p-6">
          <div className="mb-2 flex items-center gap-2 text-muted-foreground">
            <BookOpen className="h-5 w-5" />
            <span className="text-sm font-medium">Courses</span>
          </div>
          <p className="text-3xl font-bold">{coursesLoading ? "…" : courseTotal}</p>
        </div>
        <div className="rounded-xl border bg-card p-6">
          <div className="mb-2 flex items-center gap-2 text-muted-foreground">
            <Layers className="h-5 w-5" />
            <span className="text-sm font-medium">Assigned batches</span>
          </div>
          <p className="text-3xl font-bold">{batchesLoading ? "…" : batchTotal}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button asChild>
          <Link href="/admin/courses/new">
            <Plus className="mr-2 h-4 w-4" />
            New course
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/instructor/courses">My courses</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/instructor/batches">My batches</Link>
        </Button>
      </div>
    </div>
  )
}
