"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { ChevronDown, ChevronUp, Lock, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LessonVideoPlayer } from "@/components/lesson-video-player"
import { useGetEnrollmentQuery } from "@/features/enrollment/api"
import { LiveSessionsPanel } from "@/features/liveclass/components/live-sessions-panel"
import { EnrollmentRecordingsPanel } from "@/features/liveclass/components/enrollment-recordings-panel"
import { EnrollmentResourcesPanel } from "@/features/resource/components/enrollment-resources-panel"
import { enrollmentCourseId } from "@/features/enrollment/curriculum"
import type { EnrollmentDetail, EnrollmentLesson } from "@/types/api"
import { EnrollmentKind } from "@/types/api"

function formatDuration(seconds: number | null): string {
  if (!seconds) return ""
  const m = Math.round(seconds / 60)
  return `${m} min`
}

function collectLessons(detail: EnrollmentDetail): EnrollmentLesson[] {
  if (detail.kind === EnrollmentKind.BATCH) {
    return detail.subjects?.flatMap((s) => s.modules.flatMap((m) => m.lessons)) ?? []
  }
  return detail.modules?.flatMap((m) => m.lessons) ?? []
}

function LessonRow({
  lesson,
  isActive,
  onSelect,
}: {
  lesson: EnrollmentLesson
  isActive: boolean
  onSelect: (lesson: EnrollmentLesson) => void
}) {
  const hasVideo = !!lesson.videoUrl

  return (
    <div
      className={`rounded-lg border px-3 py-2 text-sm ${
        isActive ? "border-primary bg-primary/5" : "bg-background"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span>{lesson.title}</span>
        <div className="flex shrink-0 items-center gap-2">
          {lesson.durationS ? (
            <span className="text-xs text-muted-foreground">
              {formatDuration(lesson.durationS)}
            </span>
          ) : null}
          {hasVideo ? (
            <Button
              variant={isActive ? "default" : "ghost"}
              size="sm"
              onClick={() => onSelect(lesson)}
            >
              <Play className="h-4 w-4" />
            </Button>
          ) : (
            <Lock className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </div>
    </div>
  )
}

function ModulesBlock({
  detail,
  activeLessonId,
  onSelectLesson,
}: {
  detail: EnrollmentDetail
  activeLessonId: string | null
  onSelectLesson: (lesson: EnrollmentLesson) => void
}) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  const modules =
    detail.kind === EnrollmentKind.BATCH
      ? detail.subjects?.flatMap((s) => s.modules) ?? []
      : detail.modules ?? []

  return (
    <div className="space-y-3">
      {modules.map((mod, i) => {
        const isOpen = expanded[mod.id] ?? i === 0
        return (
          <div key={mod.id} className="rounded-xl bg-muted/50 p-4">
            <button
              type="button"
              className="flex w-full items-center justify-between text-left font-semibold"
              onClick={() => setExpanded((e) => ({ ...e, [mod.id]: !isOpen }))}
            >
              {mod.title}
              {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            {isOpen ? (
              <div className="mt-3 space-y-2">
                {mod.lessons.map((lesson) => (
                  <LessonRow
                    key={lesson.id}
                    lesson={lesson}
                    isActive={activeLessonId === lesson.id}
                    onSelect={onSelectLesson}
                  />
                ))}
              </div>
            ) : null}
          </div>
        )
      })}
    </div>
  )
}

export function EnrollmentPlayer({ enrollmentId }: { enrollmentId: string }) {
  const { data, isLoading, error } = useGetEnrollmentQuery(enrollmentId)
  const [activeLesson, setActiveLesson] = useState<EnrollmentLesson | null>(null)
  const [tab, setTab] = useState<"lessons" | "resources" | "recordings">("lessons")

  const detail = data?.data
  const allLessons = useMemo(
    () => (detail ? collectLessons(detail) : []),
    [detail],
  )

  useEffect(() => {
    if (!detail || activeLesson) return
    const firstPlayable = allLessons.find((l) => l.videoUrl)
    if (firstPlayable) setActiveLesson(firstPlayable)
  }, [detail, allLessons, activeLesson])

  if (isLoading) return <p className="text-muted-foreground">Loading…</p>
  if (error || !detail) {
    return (
      <div className="py-12 text-center">
        <p className="mb-4 text-muted-foreground">Enrollment not found.</p>
        <Button asChild variant="outline">
          <Link href={`/dashboard/courses/${enrollmentId}`}>Back to course</Link>
        </Button>
      </div>
    )
  }

  const title =
    detail.kind === EnrollmentKind.BATCH ? detail.batch!.title : detail.course!.title
  const productId =
    detail.kind === EnrollmentKind.BATCH ? detail.batch!.id : detail.course!.id

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        {detail.rollNumber ? (
          <p className="mt-2 text-sm text-muted-foreground">Roll: {detail.rollNumber}</p>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-2 border-b pb-2">
        {(["lessons", "resources", "recordings"] as const).map((key) => (
          <Button
            key={key}
            variant={tab === key ? "default" : "ghost"}
            size="sm"
            onClick={() => setTab(key)}
          >
            {key.charAt(0).toUpperCase() + key.slice(1)}
          </Button>
        ))}
      </div>

      {tab === "lessons" ? (
        <>
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_min(380px,34%)] lg:items-start">
            <div className="min-w-0">
              {activeLesson?.videoUrl ? (
                <div className="overflow-hidden rounded-xl border bg-black shadow-sm">
                  <LessonVideoPlayer
                    key={activeLesson.id}
                    videoUrl={activeLesson.videoUrl}
                    title={activeLesson.title}
                  />
                </div>
              ) : (
                <div className="flex aspect-video items-center justify-center rounded-xl border bg-muted/40 text-sm text-muted-foreground">
                  Select a lesson from the curriculum to start watching
                </div>
              )}
            </div>

            <div className="min-w-0 lg:sticky lg:top-24 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Curriculum
              </h2>
              <ModulesBlock
                detail={detail}
                activeLessonId={activeLesson?.id ?? null}
                onSelectLesson={setActiveLesson}
              />
            </div>
          </div>

          <LiveSessionsPanel kind={detail.kind} productId={productId} />
        </>
      ) : null}

      {tab === "resources" ? (
        <EnrollmentResourcesPanel courseId={enrollmentCourseId(detail)} />
      ) : null}

      {tab === "recordings" ? (
        <EnrollmentRecordingsPanel kind={detail.kind} productId={productId} />
      ) : null}
    </div>
  )
}
