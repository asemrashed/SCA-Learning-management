"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { CheckCircle2, ChevronDown, ChevronUp, Lock, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { LessonVideoPlayer } from "@/components/lesson-video-player"
import {
  useGetEnrollmentQuery,
  useMarkLessonCompleteMutation,
} from "@/features/enrollment/api"
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
  onComplete,
}: {
  lesson: EnrollmentLesson
  isActive: boolean
  onSelect: (lesson: EnrollmentLesson) => void
  onComplete: (id: string) => void
}) {
  const hasVideo = !!lesson.videoUrl

  return (
    <div
      className={`rounded-lg border px-3 py-2 text-sm ${
        isActive ? "border-primary bg-primary/5" : "bg-background"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className={lesson.completed ? "text-muted-foreground line-through" : ""}>
          {lesson.title}
        </span>
        <div className="flex shrink-0 items-center gap-2">
          {lesson.durationS ? (
            <span className="text-xs text-muted-foreground">
              {formatDuration(lesson.durationS)}
            </span>
          ) : null}
          {lesson.completed ? (
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          ) : hasVideo ? (
            <>
              <Button
                variant={isActive ? "default" : "ghost"}
                size="sm"
                onClick={() => onSelect(lesson)}
              >
                <Play className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => onComplete(lesson.id)}>
                Done
              </Button>
            </>
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
  onComplete,
}: {
  detail: EnrollmentDetail
  activeLessonId: string | null
  onSelectLesson: (lesson: EnrollmentLesson) => void
  onComplete: (id: string) => void
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
                    onComplete={onComplete}
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
  const { data, isLoading, error, refetch } = useGetEnrollmentQuery(enrollmentId)
  const [markComplete] = useMarkLessonCompleteMutation()
  const [activeLesson, setActiveLesson] = useState<EnrollmentLesson | null>(null)

  const detail = data?.data
  const allLessons = useMemo(
    () => (detail ? collectLessons(detail) : []),
    [detail],
  )

  useEffect(() => {
    if (!detail || activeLesson) return
    const firstPlayable =
      allLessons.find((l) => l.videoUrl && !l.completed) ??
      allLessons.find((l) => l.videoUrl)
    if (firstPlayable) setActiveLesson(firstPlayable)
  }, [detail, allLessons, activeLesson])

  async function handleComplete(lessonId: string) {
    await markComplete(lessonId)
    refetch()
  }

  if (isLoading) return <p className="text-muted-foreground">Loading…</p>
  if (error || !detail) {
    return (
      <div className="py-12 text-center">
        <p className="mb-4 text-muted-foreground">Enrollment not found.</p>
        <Button asChild variant="outline">
          <Link href="/dashboard/courses">Back to My Courses</Link>
        </Button>
      </div>
    )
  }

  const title =
    detail.kind === EnrollmentKind.BATCH ? detail.batch!.title : detail.course!.title

  return (
    <div className="space-y-6">
      <div>
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link href="/dashboard/courses">← My Courses</Link>
        </Button>
        <h1 className="text-2xl font-bold">{title}</h1>
        <div className="mt-4 max-w-md">
          <div className="mb-1 flex justify-between text-sm">
            <span>Progress</span>
            <span>{detail.progressPct}%</span>
          </div>
          <Progress value={detail.progressPct} />
        </div>
      </div>

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
          Select a lesson below to start watching
        </div>
      )}

      <ModulesBlock
        detail={detail}
        activeLessonId={activeLesson?.id ?? null}
        onSelectLesson={setActiveLesson}
        onComplete={(id) => void handleComplete(id)}
      />
    </div>
  )
}
