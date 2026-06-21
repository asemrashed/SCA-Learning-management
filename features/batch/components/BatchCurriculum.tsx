"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp, Lock, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { VideoModal } from "@/components/video-modal"
import { formatDuration } from "@/features/batch/utils"
import type { CourseSubject } from "@/types/api"
import { CHAPTERS } from "@/lib/product-vocabulary"

interface BatchCurriculumProps {
  subjects: CourseSubject[]
}

export function BatchCurriculum({ subjects }: BatchCurriculumProps) {
  const [expandedSubjects, setExpandedSubjects] = useState<Set<string>>(
    () => new Set(subjects.slice(0, 1).map((s) => s.id)),
  )
  const [preview, setPreview] = useState<{
    lessonId: string
    title: string
    duration: string
  } | null>(null)

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
    <>
      <div className="space-y-4">
        {subjects.map((subject) => {
          const isOpen = expandedSubjects.has(subject.id)
          const lessonCount = subject.modules.reduce((n, m) => n + m.lessons.length, 0)

          return (
            <div key={subject.id} className="overflow-hidden rounded-xl border border-border/60">
              <button
                type="button"
                onClick={() => toggleSubject(subject.id)}
                className="flex w-full items-center justify-between bg-muted/40 px-4 py-3 text-left hover:bg-muted/60"
              >
                <div>
                  <h3 className="font-semibold text-foreground">{subject.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {subject.modules.length} {CHAPTERS.toLowerCase()} · {lessonCount} lessons
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
                          const canPlay = lesson.isPreview && lesson.hasVideo
                          const isLocked = !lesson.isPreview && !lesson.hasVideo

                          return (
                            <li
                              key={lesson.id}
                              className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-lg bg-muted/30 px-3 py-2 text-sm"
                            >
                              <div className="flex min-w-0 items-center gap-2 w-full">
                                {canPlay ? (
                                  <Play className="h-4 w-4 shrink-0 text-primary" />
                                ) : (
                                  <Lock className="h-4 w-4 shrink-0 text-muted-foreground" />
                                )}
                                <span className="truncate text-sm font-medium text-foreground">{lesson.title}</span>
                                {lesson.isPreview && (
                                  <Badge variant="secondary" className="shrink-0 text-[10px]">
                                    Preview
                                  </Badge>
                                )}
                              </div>
                              <div className="flex shrink-0 items-center gap-2 justify-between sm:justify-end w-full sm:w-auto pl-6 sm:pl-0">
                                <span className="text-xs text-muted-foreground">
                                  {formatDuration(lesson.durationS)}
                                </span>
                                {canPlay && (
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    className="h-7 rounded-lg text-xs"
                                    onClick={() =>
                                      setPreview({
                                        lessonId: lesson.id,
                                        title: lesson.title,
                                        duration: formatDuration(lesson.durationS),
                                      })
                                    }
                                  >
                                    Preview
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
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {preview ? (
        <VideoModal
          isOpen
          onClose={() => setPreview(null)}
          lessonId={preview.lessonId}
          title={preview.title}
          duration={preview.duration}
        />
      ) : null}
    </>
  )
}
