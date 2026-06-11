"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp, Lock, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LessonVideoPlayer } from "@/components/lesson-video-player"
import type { BatchSubject } from "@/features/batch/types"
import { formatDuration } from "@/features/batch/utils"

interface BatchCurriculumProps {
  subjects: BatchSubject[]
}

export function BatchCurriculum({ subjects }: BatchCurriculumProps) {
  const [expandedSubjects, setExpandedSubjects] = useState<Set<string>>(
    () => new Set(subjects.slice(0, 1).map((s) => s.id)),
  )
  const [previewLessonId, setPreviewLessonId] = useState<string | null>(null)

  const toggleSubject = (id: string) => {
    setExpandedSubjects((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  if (!subjects.length) {
    return <p className="text-sm text-muted-foreground">Curriculum coming soon.</p>
  }

  return (
    <div className="space-y-4">
      {subjects.map((subject) => {
        const isOpen = expandedSubjects.has(subject.id)
        const lessonCount = subject.modules.reduce((n, m) => n + m.lessons.length, 0)

        return (
          <div key={subject.id} className="rounded-xl border border-border/60 overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSubject(subject.id)}
              className="flex w-full items-center justify-between bg-muted/40 px-4 py-3 text-left hover:bg-muted/60"
            >
              <div>
                <h3 className="font-semibold text-foreground">{subject.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {subject.modules.length} modules · {lessonCount} lessons
                </p>
              </div>
              {isOpen ? (
                <ChevronUp className="h-5 w-5 shrink-0 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-5 w-5 shrink-0 text-muted-foreground" />
              )}
            </button>

            {isOpen && (
              <div className="divide-y divide-border/40">
                {subject.modules.map((mod) => (
                  <div key={mod.id} className="px-4 py-3">
                    <h4 className="mb-2 text-sm font-medium text-foreground">{mod.title}</h4>
                    <ul className="space-y-2">
                      {mod.lessons.map((lesson) => {
                        const canPlay = lesson.isPreview && !!lesson.videoUrl
                        const isLocked = !lesson.isPreview && !lesson.videoUrl
                        const isPlaying = previewLessonId === lesson.id

                        return (
                          <li
                            key={lesson.id}
                            className="flex items-center justify-between rounded-lg bg-muted/30 px-3 py-2"
                          >
                            <div className="flex min-w-0 items-center gap-2">
                              {canPlay ? (
                                <Play className="h-4 w-4 shrink-0 text-primary" />
                              ) : (
                                <Lock className="h-4 w-4 shrink-0 text-muted-foreground" />
                              )}
                              <span className="truncate text-sm">{lesson.title}</span>
                              {lesson.isPreview && (
                                <Badge variant="secondary" className="shrink-0 text-[10px]">
                                  Preview
                                </Badge>
                              )}
                            </div>
                            <div className="ml-2 flex shrink-0 items-center gap-2">
                              <span className="text-xs text-muted-foreground">
                                {formatDuration(lesson.durationS)}
                              </span>
                              {canPlay && (
                                <Button
                                  type="button"
                                  size="sm"
                                  variant={isPlaying ? "default" : "outline"}
                                  className="h-7 rounded-lg text-xs"
                                  onClick={() =>
                                    setPreviewLessonId(isPlaying ? null : lesson.id)
                                  }
                                >
                                  {isPlaying ? "Hide" : "Play"}
                                </Button>
                              )}
                              {isLocked && (
                                <span className="text-xs text-muted-foreground">Locked</span>
                              )}
                            </div>
                          </li>
                        )
                      })}
                    </ul>
                    {mod.lessons.some((l) => previewLessonId === l.id && l.videoUrl) && (
                      <div className="mt-3 overflow-hidden rounded-lg bg-black">
                        <LessonVideoPlayer
                          key={previewLessonId ?? undefined}
                          videoUrl={
                            mod.lessons.find((l) => l.id === previewLessonId)?.videoUrl ?? ""
                          }
                          title={
                            mod.lessons.find((l) => l.id === previewLessonId)?.title ?? "Preview"
                          }
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
