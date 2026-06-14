"use client"

import Link from "next/link"
import Image from "next/image"
import { ArrowRight, BookOpen } from "lucide-react"
import { useSelector } from "react-redux"
import { Button } from "@/components/ui/button"
import { DEMO_STUDENT_NAME } from "@/lib/brand"
import {
  BROWSE_LIVE_COURSES,
  LIVE_COURSE,
  LIVE_COURSE_CATALOG_HREF,
  MY_LIVE_COURSES,
  SHOW_RECORDED_COURSES,
} from "@/lib/product-vocabulary"
import type { RootState } from "@/store/rootReducer"
import { useListEnrollmentsQuery } from "@/features/enrollment/api"
import { enrollmentPlayerPath } from "@/features/enrollment/utils"
import { StudentShopOverview } from "@/features/shop/components/student-shop-overview"
import { EnrollmentKind, EnrollmentStatus } from "@/types/api"

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=250&fit=crop"

export default function DashboardPage() {
  const user = useSelector((state: RootState) => state.auth.user)
  const displayName = user?.name?.split(" ")[0] ?? DEMO_STUDENT_NAME
  const { data, isLoading, error } = useListEnrollmentsQuery()

  const enrollments = (data?.data ?? []).filter(
    (e) => SHOW_RECORDED_COURSES || e.kind === EnrollmentKind.BATCH,
  )
  const activeEnrollments = enrollments.filter(
    (e) => e.status === EnrollmentStatus.ACTIVE || e.status === EnrollmentStatus.COMPLETED,
  )
  const pendingCount = enrollments.filter((e) => e.status === EnrollmentStatus.PENDING).length
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
          <Link href={LIVE_COURSE_CATALOG_HREF}>
            {BROWSE_LIVE_COURSES}
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
            <BookOpen className="h-5 w-5" />
            <span className="text-sm font-medium">Active</span>
          </div>
          <p className="text-3xl font-bold">{isLoading ? "…" : activeEnrollments.length}</p>
        </div>
        <div className="rounded-xl border bg-card p-6">
          <div className="mb-2 flex items-center gap-2 text-muted-foreground">
            <BookOpen className="h-5 w-5" />
            <span className="text-sm font-medium">Pending approval</span>
          </div>
          <p className="text-3xl font-bold">{isLoading ? "…" : pendingCount}</p>
        </div>
      </div>

      <div className="mb-10">
        <StudentShopOverview />
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl font-bold text-foreground">Continue learning</h2>
        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard/batches">{MY_LIVE_COURSES}</Link>
        </Button>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Loading your enrollments…</p>
      ) : error ? (
        <p className="text-destructive">Could not load enrollments.</p>
      ) : continueItems.length === 0 ? (
        <div className="rounded-xl border border-dashed p-10 text-center">
          <p className="mb-4 text-muted-foreground">
            {pendingCount > 0
              ? "Your enrollment request is awaiting admin approval."
              : `You are not enrolled in any ${LIVE_COURSE.toLowerCase()}s yet.`}
          </p>
          <Button asChild>
            <Link href={LIVE_COURSE_CATALOG_HREF}>{BROWSE_LIVE_COURSES}</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {continueItems.map((item) => {
            const title = item.batch!.title
            const image = item.batch!.thumbnail ?? PLACEHOLDER_IMAGE
            return (
              <Link
                key={item.id}
                href={enrollmentPlayerPath(item.kind, item.id)}
                className="flex overflow-hidden rounded-xl border bg-card transition-colors hover:bg-muted/30"
              >
                <div className="relative h-28 w-40 shrink-0">
                  <Image src={image} alt={title} fill className="object-cover" />
                </div>
                <div className="flex flex-1 flex-col justify-center p-4">
                  <p className="text-xs text-muted-foreground">{LIVE_COURSE}</p>
                  <h3 className="font-semibold">{title}</h3>
                  {item.rollNumber ? (
                    <p className="text-sm text-muted-foreground">Roll: {item.rollNumber}</p>
                  ) : null}
                </div>
                <div className="flex items-center pr-4">
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
