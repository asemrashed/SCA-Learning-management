"use client"

import { use } from "react"
import { CourseDetailView } from "@/features/course/components/course-detail-view"
import { AppLoading } from "@/components/status/app-loading"
import { AppNotFound } from "@/components/status/app-not-found"
import { useGetCourseQuery } from "@/features/course/api"

export default function CourseDetailsPage({
  params,
}: {
  params: Promise<{ idOrSlug: string }>
}) {
  const { idOrSlug } = use(params)
  const { data, isLoading, error } = useGetCourseQuery(idOrSlug)

  return (
    <main className="py-8">
      <div className="container mx-auto px-4">
        {isLoading ? (
          <AppLoading message="Loading course…" />
        ) : error || !data?.data ? (
          <AppNotFound
            title="Course not found"
            description="This course may have been removed or is not yet published."
            backHref="/courses"
            backLabel="Back to Courses"
          />
        ) : (
          <CourseDetailView course={data.data} />
        )}
      </div>
    </main>
  )
}
