"use client"

import { useState } from "react"
import Image from "next/image"
import { BookOpen, Clock, Play } from "lucide-react"
import { EnrollButton } from "@/features/enrollment/components/enroll-button"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { VideoModal } from "@/components/video-modal"
import { formatBdtMinor } from "@/lib/format-currency"
import { CHAPTERS, deliveryModeLabel } from "@/lib/product-vocabulary"
import type { CourseDetail, CourseModule } from "@/types/api"
import { BatchCurriculum } from "@/features/batch/components/BatchCurriculum"
import { CurriculumTree } from "./curriculum-tree"
import { DeliveryMode } from "@/types/api"

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
  const subjects = course.subjects ?? []
  const isRecorded = course.deliveryMode === DeliveryMode.RECORDED
  const previewLesson = isRecorded
    ? modules.flatMap((m) => m.lessons).find((l) => l.isPreview && l.videoUrl)
    : subjects
        .flatMap((s) => s.modules.flatMap((m) => m.lessons))
        .find((l) => l.isPreview && l.videoUrl)
  const [previewOpen, setPreviewOpen] = useState(false)
  const lessonCount = isRecorded
    ? modules.reduce((n, m) => n + m.lessons.length, 0)
    : subjects.reduce((n, s) => n + s.modules.reduce((m, mod) => m + mod.lessons.length, 0), 0)

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
            {course.description ? (
              <p className="mb-6 text-muted-foreground">{course.description}</p>
            ) : null}
            <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <BookOpen className="h-5 w-5" />
                {isRecorded
                  ? `${modules.length} ${CHAPTERS.toLowerCase()} · ${lessonCount} lessons`
                  : `${subjects.length} subjects · ${lessonCount} lessons`}
              </span>
              {isRecorded ? (
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-5 w-5" />
                  {formatTotalDuration(totalDurationS(modules))}
                </span>
              ) : null}
            </div>
          </div>

          <div className="rounded-[20px] bg-card p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-bold text-foreground">Curriculum</h2>
            {isRecorded ? (
              <CurriculumTree modules={modules} />
            ) : (
              <BatchCurriculum subjects={subjects} />
            )}
          </div>
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
              <span className="text-3xl font-bold text-foreground">
                {course.priceMinor === 0 ? "Free" : formatBdtMinor(course.priceMinor)}
              </span>
            </div>

            {isRecorded ? (
              <EnrollButton
                courseId={course.id}
                productTitle={course.title}
                className="mb-3 w-full rounded-xl text-lg"
              />
            ) : (
              <p className="text-sm text-muted-foreground">
                Live courses enroll by batch cohort — browse available batches from the home page.
              </p>
            )}
          </div>
        </div>
      </div>

      {previewLesson ? (
        <VideoModal
          isOpen={previewOpen}
          onClose={() => setPreviewOpen(false)}
          videoUrl={previewLesson.videoUrl!}
          title={previewLesson.title}
          duration={formatLessonDuration(previewLesson.durationS)}
        />
      ) : null}
    </>
  )
}
