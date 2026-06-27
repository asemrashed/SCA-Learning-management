"use client"

import { useState } from "react"
import Image from "next/image"
import { BookOpen, Clock, Play, Users, Calendar, ArrowRight } from "lucide-react"
import { AppLoading } from "@/components/status/app-loading"
import { AppNotFound } from "@/components/status/app-not-found"
import { EnrollButton } from "@/features/enrollment/components/enroll-button"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { VideoModal } from "@/components/video-modal"
import { FAQAccordion } from "@/components/faq-accordion"
import { ExpandableRichContent } from "@/components/expandable-rich-content"
import { formatBdtMinor } from "@/lib/format-currency"
import { CHAPTERS, BROWSE_COURSES, COURSE_CATALOG_HREF, deliveryModeLabel } from "@/lib/product-vocabulary"
import type { CourseDetail, CourseLesson, CourseModule } from "@/types/api"
import { CurriculumTree } from "./curriculum-tree"
import { DeliveryMode } from "@/types/api"
import { formatBatchDate, BATCH_STATUS_LABEL } from "@/features/batch/utils"
import { isPreviewableLesson } from "@/features/enrollment/lib/lesson-view"
import { useGetCourseQuery } from "@/features/course/api"
import { MARKETING_NAV_CLEARANCE, marketingHeroSection } from "@/lib/marketing-layout"
import { cn } from "@/lib/utils"

const COURSE_HERO_FALLBACK =
  "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&h=600&fit=crop"

interface CourseDetailViewProps {
  idOrSlug: string
}

function totalDurationS(modules: CourseModule[]): number {
  return modules.reduce(
    (sum, mod) => sum + mod.lessons.reduce((s, l) => s + (l.durationS ?? 0), 0),
    0,
  )
}

function formatTotalDuration(seconds: number): string {
  if (!seconds) return "Self-paced"
  const hours = Math.round(seconds / 3600)
  return hours > 0 ? `${hours}+ hours` : `${Math.round(seconds / 60)} min`
}

function formatLessonDuration(seconds: number | null): string {
  if (!seconds) return ""
  const mins = Math.round(seconds / 60)
  return `${mins} min`
}

export function CourseDetailView({ idOrSlug }: CourseDetailViewProps) {
  const { data, isLoading, isError } = useGetCourseQuery(idOrSlug)
  const course = data?.data

  if (isLoading) {
    return (
      <main className={`overflow-x-hidden py-8 ${MARKETING_NAV_CLEARANCE}`}>
        <div className="container mx-auto max-w-full px-4">
          <AppLoading message="Loading course…" />
        </div>
      </main>
    )
  }

  if (isError || !course) {
    return (
      <main className={`overflow-x-hidden py-8 ${MARKETING_NAV_CLEARANCE}`}>
        <div className="container mx-auto max-w-full px-4">
          <AppNotFound
            title="Course not found"
            description="This course may have been removed or is not yet published."
            backHref={COURSE_CATALOG_HREF}
            backLabel={BROWSE_COURSES}
          />
        </div>
      </main>
    )
  }

  return <CourseDetailContent course={course} />
}

function CourseDetailContent({ course }: { course: CourseDetail }) {
  const modules = course.modules ?? []
  const isRecorded = course.deliveryMode === DeliveryMode.RECORDED
  const batches = course.batches ?? []

  const sortedBatches = isRecorded
    ? []
    : [...batches].sort((a, b) => {
        const dateA = a.startDate ? new Date(a.startDate).getTime() : 0
        const dateB = b.startDate ? new Date(b.startDate).getTime() : 0
        return dateB - dateA
      })

  const previewLesson: CourseLesson | undefined = isRecorded
    ? modules.flatMap((m) => m.lessons).find((l) => isPreviewableLesson(l))
    : undefined
  const [previewOpen, setPreviewOpen] = useState(false)
  const lessonCount = isRecorded ? modules.reduce((n, m) => n + m.lessons.length, 0) : 0

  if (!isRecorded) {
    const upcomingBatch = sortedBatches.find((b) => b.status === "UPCOMING" || b.status === "ACTIVE")

    return (
      <main className="py-8">
        <div className="container mx-auto max-w-full px-4">
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="order-2 space-y-8 lg:order-1 lg:col-span-2">
              <div
                className={cn(
                  "rounded-[24px] bg-gradient-to-br from-primary/10 via-accent/5 to-background p-6 md:p-8",
                  marketingHeroSection("max-lg:mt-0 max-lg:pt-0"),
                )}
              >
                <div className="mb-4 flex flex-wrap gap-2">
                  <Badge variant="outline">{deliveryModeLabel(course.deliveryMode)}</Badge>
                  {course.category ? <Badge variant="secondary">{course.category}</Badge> : null}
                </div>
                <h1 className="mb-4 text-2xl font-bold text-foreground md:text-3xl lg:text-4xl">
                  {course.title}
                </h1>
                <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <BookOpen className="h-5 w-5" />
                    {batches.length} batch{batches.length === 1 ? "" : "es"} available
                  </span>
                  {course.studentCount !== undefined && course.studentCount > 0 ? (
                    <span className="inline-flex items-center gap-1">
                      <Users className="h-5 w-5" />
                      {course.studentCount} student{course.studentCount === 1 ? "" : "s"} enrolled
                    </span>
                  ) : null}
                </div>
              </div>

              {course.description ? <ExpandableRichContent html={course.description} /> : null}

              <div className="rounded-[20px] bg-card p-6 shadow-sm">
                <h2 className="mb-4 text-xl font-bold text-foreground">Available Batches</h2>
                {sortedBatches.length > 0 ? (
                  <div className="space-y-3">
                    {sortedBatches.map((b) => (
                      <div
                        key={b.id}
                        className="group relative flex flex-col justify-between gap-4 rounded-xl border border-border bg-card p-4 transition-all hover:border-primary sm:flex-row sm:items-center"
                      >
                        <div className="space-y-1.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-semibold text-foreground transition-colors group-hover:text-primary">
                              <a href={`/batches/${b.slug}`}>{b.title}</a>
                            </h3>
                            <Badge
                              variant={
                                b.status === "ACTIVE"
                                  ? "destructive"
                                  : b.status === "UPCOMING"
                                    ? "secondary"
                                    : "outline"
                              }
                            >
                              {BATCH_STATUS_LABEL[b.status] || b.status}
                            </Badge>
                          </div>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5 text-primary" />
                              Starts: {formatBatchDate(b.startDate)}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between gap-4 sm:justify-end">
                          <span className="text-lg font-bold text-foreground">
                            {b.priceMinor === 0 ? "Free" : formatBdtMinor(b.priceMinor)}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-lg border-primary/20 hover:bg-primary hover:text-primary-foreground"
                            asChild
                          >
                            <a href={`/batches/${b.slug}`}>
                              View Batch
                              <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                            </a>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No batches open for enrollment yet.</p>
                )}
              </div>

              {course.faq?.length ? (
                <div className="rounded-[20px] bg-card p-6 shadow-sm">
                  <h2 className="mb-4 text-xl font-bold text-foreground">Frequently Asked Questions</h2>
                  <FAQAccordion items={course.faq} />
                </div>
              ) : null}
            </div>

            <div
              className={cn(
                "order-1 lg:order-2 lg:col-span-1",
                marketingHeroSection("lg:mt-0 lg:pt-0"),
              )}
            >
              <div className="rounded-[20px] bg-card p-6 shadow-lg lg:sticky lg:top-28">
                <div className="relative mb-6 aspect-video overflow-hidden rounded-xl bg-muted shadow-sm">
                  <Image
                    src={course.thumbnail || COURSE_HERO_FALLBACK}
                    alt={course.title}
                    fill
                    priority
                    className="object-cover"
                  />
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between rounded-xl bg-muted/50 px-4 py-3">
                    <span className="text-muted-foreground">Format</span>
                    <span className="font-medium text-foreground">
                      {deliveryModeLabel(course.deliveryMode)}
                    </span>
                  </div>
                  {course.category ? (
                    <div className="flex items-center justify-between rounded-xl bg-muted/50 px-4 py-3">
                      <span className="text-muted-foreground">Category</span>
                      <span className="font-medium text-foreground">{course.category}</span>
                    </div>
                  ) : null}
                  <div className="flex items-center justify-between rounded-xl bg-primary/10 px-4 py-3">
                    <span className="text-primary">Open batches</span>
                    <span className="font-medium text-primary">{batches.length}</span>
                  </div>
                  {course.studentCount !== undefined && course.studentCount > 0 ? (
                    <div className="flex items-center justify-between rounded-xl bg-accent/10 px-4 py-3">
                      <span className="text-accent">Students enrolled</span>
                      <span className="font-medium text-accent">{course.studentCount}</span>
                    </div>
                  ) : null}
                  {upcomingBatch ? (
                    <div className="flex items-center justify-between rounded-xl bg-muted/50 px-4 py-3">
                      <span className="text-muted-foreground">Next start</span>
                      <span className="font-medium">{formatBatchDate(upcomingBatch.startDate)}</span>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className={`overflow-x-hidden py-8 ${MARKETING_NAV_CLEARANCE}`}>
      <div className="container mx-auto max-w-full px-4">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="order-2 space-y-8 lg:order-1 lg:col-span-2">
            <div className="rounded-[24px] bg-gradient-to-br from-primary/10 via-accent/5 to-background p-6 md:p-8">
              <div className="mb-4 flex flex-wrap gap-2">
                <Badge variant="outline">{deliveryModeLabel(course.deliveryMode)}</Badge>
                {course.category ? <Badge variant="secondary">{course.category}</Badge> : null}
              </div>
              <h1 className="mb-4 text-2xl font-bold text-foreground md:text-3xl lg:text-4xl">
                {course.title}
              </h1>
              <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <BookOpen className="h-5 w-5" />
                  {modules.length} {CHAPTERS.toLowerCase()} · {lessonCount} lessons
                </span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-5 w-5" />
                  {formatTotalDuration(totalDurationS(modules))}
                </span>
                {course.studentCount !== undefined && course.studentCount > 0 ? (
                  <span className="inline-flex items-center gap-1">
                    <Users className="h-5 w-5" />
                    {course.studentCount} student{course.studentCount === 1 ? "" : "s"} enrolled
                  </span>
                ) : null}
              </div>
            </div>

            {course.description ? <ExpandableRichContent html={course.description} /> : null}

            <div className="rounded-[20px] bg-card p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-bold text-foreground">Curriculum</h2>
              <CurriculumTree modules={modules} />
            </div>

            {course.faq?.length ? (
              <div className="rounded-[20px] bg-card p-6 shadow-sm">
                <h2 className="mb-4 text-xl font-bold text-foreground">
                  Frequently Asked Questions
                </h2>
                <FAQAccordion items={course.faq} />
              </div>
            ) : null}
          </div>

          <div className="order-1 lg:order-2 lg:col-span-1">
            <div className="rounded-[20px] bg-card p-6 shadow-lg lg:sticky lg:top-24">
              <div className="relative mb-6 aspect-video overflow-hidden rounded-xl bg-muted">
                {course.thumbnail ? (
                  <Image
                    src={course.thumbnail}
                    alt={course.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    No thumbnail
                  </div>
                )}
                {previewLesson ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                    <Button
                      size="lg"
                      className="rounded-full"
                      onClick={() => setPreviewOpen(true)}
                    >
                      <Play className="mr-2 h-5 w-5" />
                      Preview
                    </Button>
                  </div>
                ) : null}
              </div>

              <div className="mb-6">
                <span className="text-3xl font-bold text-foreground">
                  {course.priceMinor === 0 ? "Free" : formatBdtMinor(course.priceMinor)}
                </span>
              </div>

              <EnrollButton
                courseId={course.id}
                productTitle={course.title}
                className="mb-3 w-full rounded-xl text-lg"
              />
            </div>
          </div>
        </div>

        {previewLesson ? (
          <VideoModal
            isOpen={previewOpen}
            onClose={() => setPreviewOpen(false)}
            lesson={{
              id: previewLesson.id,
              title: previewLesson.title,
              type: previewLesson.type,
              hasVideo: previewLesson.hasVideo,
              hasDocument: previewLesson.hasDocument,
              content: previewLesson.content ?? null,
              videoUrl: previewLesson.videoUrl ?? null,
            }}
            title={previewLesson.title}
            duration={formatLessonDuration(previewLesson.durationS)}
          />
        ) : null}
      </div>
    </main>
  )
}
