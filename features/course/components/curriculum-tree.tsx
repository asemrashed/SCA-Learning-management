"use client"

import { useState } from "react"
import { Lock, Play, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { VideoModal, type PreviewLesson } from "@/components/video-modal"
import {
  isPreviewableLesson,
} from "@/features/enrollment/lib/lesson-view"
import type { CourseLesson, CourseModule } from "@/types/api"

function formatDuration(seconds: number | null): string {
  if (!seconds) return ""
  const mins = Math.round(seconds / 60)
  return `${mins} min`
}

interface CurriculumTreeProps {
  modules: CourseModule[]
  initialVisible?: number
  /** Staff preview: unlock all lessons with content, not only `isPreview`. */
  adminMode?: boolean
}

export function CurriculumTree({
  modules,
  initialVisible = 4,
  adminMode = false,
}: CurriculumTreeProps) {
  const [expanded, setExpanded] = useState(false)
  const [preview, setPreview] = useState<PreviewLesson | null>(null)
  const [previewDuration, setPreviewDuration] = useState("")
  const visibleModules = expanded ? modules : modules.slice(0, initialVisible)

  if (modules.length === 0) {
    return <p className="text-sm text-muted-foreground">Curriculum coming soon.</p>
  }

  function openLesson(lesson: CourseLesson) {
    setPreview({
      id: lesson.id,
      title: lesson.title,
      type: lesson.type,
      hasVideo: lesson.hasVideo,
      hasDocument: lesson.hasDocument,
      content: lesson.content ?? null,
      videoUrl: lesson.videoUrl ?? null,
    })
    setPreviewDuration(formatDuration(lesson.durationS))
  }

  return (
    <>
      <div className="space-y-3 overflow-hidden">
        {visibleModules.map((mod, index) => (
          <div key={mod.id} className="overflow-hidden rounded-xl bg-muted/50 p-4">
            <h3 className="font-semibold text-foreground">
              Module {index + 1}: {mod.title}
            </h3>
            <p className="mb-3 text-sm text-muted-foreground">
              {mod.lessons.length} lesson{mod.lessons.length === 1 ? "" : "s"}
            </p>
            <ul className="space-y-2">
              {mod.lessons.map((lesson) => {
                const canOpen = isPreviewableLesson(lesson, adminMode)
                return (
                  <li
                    key={lesson.id}
                    className="flex flex-col gap-2 rounded-lg bg-background/80 px-3 py-2 text-sm sm:flex-row sm:items-center sm:justify-between"
                  >
                    <span className="min-w-0 flex-1 break-words font-medium leading-snug text-foreground line-clamp-2">
                      {lesson.title}
                    </span>
                    <div className="flex shrink-0 items-center gap-2 justify-between text-muted-foreground sm:justify-end">
                      {lesson.durationS ? (
                        <span className="text-xs">{formatDuration(lesson.durationS)}</span>
                      ) : null}
                      {canOpen ? (
                        <button
                          type="button"
                          onClick={() => openLesson(lesson)}
                          className="inline-flex items-center gap-1 text-primary hover:underline text-xs"
                        >
                          <Play className="h-4 w-4" />
                          {adminMode && !lesson.isPreview ? "View" : "Preview"}
                        </button>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs">
                          <Lock className="h-3.5 w-3.5" />
                          Locked
                        </span>
                      )}
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}

        {modules.length > initialVisible && (
          <Button variant="ghost" className="w-full" onClick={() => setExpanded(!expanded)}>
            {expanded ? (
              <>
                Show Less <ChevronUp className="ml-2 h-4 w-4" />
              </>
            ) : (
              <>
                + {modules.length - initialVisible} more modules{" "}
                <ChevronDown className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        )}
      </div>

      {preview ? (
        <VideoModal
          isOpen
          onClose={() => setPreview(null)}
          lesson={preview}
          title={preview.title}
          duration={previewDuration}
        />
      ) : null}
    </>
  )
}
