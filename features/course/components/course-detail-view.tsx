"use client"

import { useState } from "react"
import Image from "next/image"
import { BookOpen, Clock, Play, Users, Calendar, ArrowRight } from "lucide-react"
import { EnrollButton } from "@/features/enrollment/components/enroll-button"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { VideoModal } from "@/components/video-modal"
import { FAQAccordion } from "@/components/faq-accordion"
import { ExpandableRichContent } from "@/components/expandable-rich-content"
import { formatBdtMinor } from "@/lib/format-currency"
import { CHAPTERS, deliveryModeLabel } from "@/lib/product-vocabulary"
import type { CourseDetail, CourseLesson, CourseModule } from "@/types/api"
import { CurriculumTree } from "./curriculum-tree"
import { DeliveryMode } from "@/types/api"
import { formatBatchDate, BATCH_STATUS_LABEL } from "@/features/batch/utils"
import { isPreviewableLesson } from "@/features/enrollment/lib/lesson-view"

interface CourseDetailViewProps {
  course: CourseDetail
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

export function CourseDetailView({ course }: CourseDetailViewProps) {
  const modules = course.modules ?? []
  const isRecorded = course.deliveryMode === DeliveryMode.RECORDED
  const batches = course.batches ?? []
  
  // Sort batches: latest batch on top (by startDate descending)
  const sortedBatches = isRecorded
    ? []
    : [...batches].sort((a, b) => {
        const dateA = a.startDate ? new Date(a.startDate).getTime() : 0
        const dateB = b.startDate ? new Date(b.startDate).getTime() : 0
        return dateB - dateA
      })

  const latestBatch = isRecorded
    ? undefined
    : sortedBatches.find((b) => b.status === "ACTIVE" || b.status === "UPCOMING") || sortedBatches[0]

  const previewLesson: CourseLesson | undefined = isRecorded
    ? modules.flatMap((m) => m.lessons).find((l) => isPreviewableLesson(l))
    : undefined
  const [previewOpen, setPreviewOpen] = useState(false)
  const lessonCount = isRecorded
    ? modules.reduce((n, m) => n + m.lessons.length, 0)
    : 0

  return (
    <>
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
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
                {isRecorded
                  ? `${modules.length} ${CHAPTERS.toLowerCase()} · ${lessonCount} lessons`
                  : `${batches.length} batch${batches.length === 1 ? "" : "es"} available`}
              </span>
              {isRecorded ? (
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-5 w-5" />
                  {formatTotalDuration(totalDurationS(modules))}
                </span>
              ) : null}
              {course.studentCount !== undefined && course.studentCount > 0 ? (
                <span className="inline-flex items-center gap-1">
                  <Users className="h-5 w-5" />
                  {course.studentCount} student{course.studentCount === 1 ? "" : "s"} enrolled
                </span>
              ) : null}
            </div>
          </div>

          {course.description ? (
            <ExpandableRichContent html={course.description} />
          ) : null}

          <div className="rounded-[20px] bg-card p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-bold text-foreground">
              {isRecorded ? "Curriculum" : "Available Batches"}
            </h2>
            {isRecorded ? (
              <CurriculumTree modules={modules} />
            ) : sortedBatches.length > 0 ? (
              <div className="space-y-3">
                {sortedBatches.map((b) => (
                  <div
                    key={b.id}
                    className="group relative flex flex-col justify-between gap-4 rounded-xl border border-border bg-card p-4 transition-all hover:border-primary sm:flex-row sm:items-center"
                  >
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                          <a href={`/batches/${b.slug}`}>
                            {b.title}
                          </a>
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
                        {(b as any)._count?.enrollments !== undefined && (b as any)._count.enrollments > 0 ? (
                          <span className="flex items-center gap-1">
                            <Users className="h-3.5 w-3.5 text-primary" />
                            {(b as any)._count.enrollments} enrolled
                          </span>
                        ) : null}
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
              <h2 className="mb-4 text-xl font-bold text-foreground">
                Frequently Asked Questions
              </h2>
              <FAQAccordion items={course.faq} />
            </div>
          ) : null}
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-24 rounded-[20px] bg-card p-6 shadow-lg">
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
              {isRecorded ? (
                <span className="text-3xl font-bold text-foreground">
                  {course.priceMinor === 0 ? "Free" : formatBdtMinor(course.priceMinor)}
                </span>
              ) : latestBatch ? (
                <div className="space-y-1">
                  <span className="text-3xl font-bold text-foreground">
                    {latestBatch.priceMinor === 0 ? "Free" : formatBdtMinor(latestBatch.priceMinor)}
                  </span>
                  <p className="text-xs text-muted-foreground">
                    Enrollment price for {latestBatch.title}
                  </p>
                </div>
              ) : (
                <span className="text-sm text-muted-foreground">
                  Enrollment price is set per batch cohort
                </span>
              )}
            </div>

            {isRecorded ? (
              <EnrollButton
                courseId={course.id}
                productTitle={course.title}
                className="mb-3 w-full rounded-xl text-lg"
              />
            ) : latestBatch ? (
              <div className="space-y-3">
                <EnrollButton
                  batchId={latestBatch.id}
                  productTitle={latestBatch.title}
                  className="w-full rounded-xl text-lg"
                />
                <p className="text-center text-xs text-muted-foreground">
                  Cohort starts on {formatBatchDate(latestBatch.startDate)}
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No active cohorts available for enrollment at the moment.
              </p>
            )}
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
    </>
  )
}
