"use client"

import Link from "next/link"
import { use } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { CourseDetailView } from "@/features/course/components/course-detail-view"
import { useGetCourseQuery } from "@/features/course/api"

export default function CourseDetailsPage({
  params,
}: {
  params: Promise<{ idOrSlug: string }>
}) {
  const { idOrSlug } = use(params)
  const { data, isLoading, error } = useGetCourseQuery(idOrSlug)

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="py-8">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <p className="py-20 text-center text-muted-foreground">Loading course…</p>
          ) : error || !data?.data ? (
            <div className="py-20 text-center">
              <p className="mb-4 text-muted-foreground">Course not found.</p>
              <Button asChild variant="outline">
                <Link href="/courses">Back to catalog</Link>
              </Button>
            </div>
          ) : (
            <CourseDetailView course={data.data} />
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
