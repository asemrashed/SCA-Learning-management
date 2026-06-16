"use client"

import { useEffect, useState } from "react"
import { Lock, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LessonVideoPlayer } from "@/components/lesson-video-player"

export interface PlayableLesson {
  id: string
  title: string
  videoUrl: string | null
  durationS?: number | null
}

function formatDuration(seconds: number | null | undefined): string {
  if (!seconds) return ""
  const m = Math.round(seconds / 60)
  return `${m} min`
}

function LessonRow({
  lesson,
  isActive,
  onSelect,
}: {
  lesson: PlayableLesson
  isActive: boolean
  onSelect: (lesson: PlayableLesson) => void
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

export function ModuleLessonPlayer({
  lessons,
  playlistTitle = "Lessons",
  subjectTitle,
  initialLessonId,
}: {
  lessons: PlayableLesson[]
  playlistTitle?: string
  subjectTitle?: string | null
  initialLessonId?: string | null
}) {
  const [activeLesson, setActiveLesson] = useState<PlayableLesson | null>(null)

  useEffect(() => {
    if (activeLesson) return
    const preferred = initialLessonId
      ? lessons.find((l) => l.id === initialLessonId && l.videoUrl)
      : null
    const firstPlayable = preferred ?? lessons.find((l) => l.videoUrl)
    if (firstPlayable) setActiveLesson(firstPlayable)
  }, [lessons, initialLessonId, activeLesson])

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_min(380px,34%)] lg:items-start">
      <div className="min-w-0">
        {activeLesson?.videoUrl ? (
          <div className="space-y-2">
            {subjectTitle || playlistTitle ? (
              <p className="text-sm text-muted-foreground">
                {subjectTitle ? (
                  <span className="font-medium text-primary">{subjectTitle}</span>
                ) : null}
                {subjectTitle && playlistTitle ? <span> · </span> : null}
                {playlistTitle ? <span>{playlistTitle}</span> : null}
              </p>
            ) : null}
            <div className="overflow-hidden rounded-xl border bg-black shadow-sm">
              <LessonVideoPlayer
                key={activeLesson.id}
                videoUrl={activeLesson.videoUrl}
                title={activeLesson.title}
              />
            </div>
            <p className="font-medium">{activeLesson.title}</p>
          </div>
        ) : (
          <div className="flex aspect-video items-center justify-center rounded-xl border bg-muted/40 text-sm text-muted-foreground">
            Select a lesson from the playlist to start watching
          </div>
        )}
      </div>

      <div className="min-w-0 lg:sticky lg:top-24 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto">
        {subjectTitle ? (
          <p className="mb-1 text-sm font-medium text-primary">{subjectTitle}</p>
        ) : null}
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          {playlistTitle}
        </h2>
        <div className="space-y-2">
          {lessons.map((lesson) => (
            <LessonRow
              key={lesson.id}
              lesson={lesson}
              isActive={activeLesson?.id === lesson.id}
              onSelect={setActiveLesson}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
