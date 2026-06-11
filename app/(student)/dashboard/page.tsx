"use client"

import Link from "next/link"
import { ArrowRight, BookOpen, CheckCircle2, TrendingUp } from "lucide-react"
import { useSelector } from "react-redux"
import { Button } from "@/components/ui/button"
import { ProgressCard } from "@/components/progress-card"
import { DEMO_STUDENT_NAME } from "@/lib/brand"
import type { RootState } from "@/store/rootReducer"
import { useListEnrollmentsQuery } from "@/features/enrollment/api"
import { EnrollmentKind, EnrollmentStatus } from "@/types/api"

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=250&fit=crop"

export default function DashboardPage() {
  const user = useSelector((state: RootState) => state.auth.user)
  const displayName = user?.name?.split(" ")[0] ?? DEMO_STUDENT_NAME
  const { data, isLoading, error } = useListEnrollmentsQuery()

  const enrollments = data?.data ?? []
  const activeEnrollments = enrollments.filter(
    (e) => e.status === EnrollmentStatus.ACTIVE || e.status === EnrollmentStatus.COMPLETED,
  )
  const completedLessons = enrollments.reduce((sum, e) => sum + e.completedLessons, 0)
  const totalLessons = enrollments.reduce((sum, e) => sum + e.totalLessons, 0)
  const overallProgress =
    totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0

  const continueItems = activeEnrollments.slice(0, 3)

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground md:text-3xl">
            Welcome back, {displayName}!
          </h1>
          <p className="text-muted-foreground">Continue your learning where you left off.</p>
        </div>
        <Button className="rounded-xl" asChild>
          <Link href="/courses">
            Browse courses
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border bg-card p-6">
          <div className="mb-2 flex items-center gap-2 text-muted-foreground">
            <BookOpen className="h-5 w-5" />
            <span className="text-sm font-medium">Enrollments</span>
          </div>
          <p className="text-3xl font-bold">{isLoading ? "…" : enrollments.length}</p>
        </div>
        <div className="rounded-xl border bg-card p-6">
          <div className="mb-2 flex items-center gap-2 text-muted-foreground">
            <CheckCircle2 className="h-5 w-5" />
            <span className="text-sm font-medium">Lessons completed</span>
          </div>
          <p className="text-3xl font-bold">{isLoading ? "…" : completedLessons}</p>
        </div>
        <div className="rounded-xl border bg-card p-6">
          <div className="mb-2 flex items-center gap-2 text-muted-foreground">
            <TrendingUp className="h-5 w-5" />
            <span className="text-sm font-medium">Overall progress</span>
          </div>
          <p className="text-3xl font-bold">{isLoading ? "…" : `${overallProgress}%`}</p>
        </div>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">Continue learning</h2>
        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard/courses">View all</Link>
        </Button>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Loading your courses…</p>
      ) : error ? (
        <p className="text-destructive">Could not load enrollments.</p>
      ) : continueItems.length === 0 ? (
        <div className="rounded-xl border border-dashed p-10 text-center">
          <p className="mb-4 text-muted-foreground">
            {enrollments.length > 0
              ? "Complete payment on pending enrollments to start learning."
              : "You are not enrolled in any courses yet."}
          </p>
          <Button asChild>
            <Link href="/courses">Find a course</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {continueItems.map((item) => {
            const isBatch = item.kind === EnrollmentKind.BATCH
            const title = isBatch ? item.batch!.title : item.course!.title
            const image =
              (isBatch ? item.batch!.thumbnail : item.course!.thumbnail) ?? PLACEHOLDER_IMAGE
            return (
              <ProgressCard
                key={item.id}
                id={item.id}
                title={title}
                image={image}
                progress={item.progressPct}
                totalLessons={item.totalLessons}
                completedLessons={item.completedLessons}
                nextLesson={item.nextLesson?.title}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}
