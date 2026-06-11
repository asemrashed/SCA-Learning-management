"use client"

import { useState } from "react"
import { Lock, Play, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { VideoModal } from "@/components/video-modal"
import type { CourseModule } from "@/types/api"

function formatDuration(seconds: number | null): string {
  if (!seconds) return ""
  const mins = Math.round(seconds / 60)
  return `${mins} min`
}

interface CurriculumTreeProps {
  modules: CourseModule[]
  initialVisible?: number
}

export function CurriculumTree({ modules, initialVisible = 4 }: CurriculumTreeProps) {
  const [expanded, setExpanded] = useState(false)
  const [preview, setPreview] = useState<{
    videoUrl: string
    title: string
    duration: string
  } | null>(null)
  const visibleModules = expanded ? modules : modules.slice(0, initialVisible)

  if (modules.length === 0) {
    return <p className="text-sm text-muted-foreground">Curriculum coming soon.</p>
  }

  return (
    <>
      <div className="space-y-3">
        {visibleModules.map((mod, index) => (
          <div key={mod.id} className="rounded-xl bg-muted/50 p-4">
            <h3 className="font-semibold text-foreground">
              Module {index + 1}: {mod.title}
            </h3>
            <p className="mb-3 text-sm text-muted-foreground">
              {mod.lessons.length} lesson{mod.lessons.length === 1 ? "" : "s"}
            </p>
            <ul className="space-y-2">
              {mod.lessons.map((lesson) => {
                const playable = lesson.isPreview && lesson.videoUrl
                return (
                  <li
                    key={lesson.id}
                    className="flex items-center justify-between rounded-lg bg-background/80 px-3 py-2 text-sm"
                  >
                    <span className="text-foreground">{lesson.title}</span>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      {lesson.durationS ? (
                        <span className="text-xs">{formatDuration(lesson.durationS)}</span>
                      ) : null}
                      {playable ? (
                        <button
                          type="button"
                          onClick={() =>
                            setPreview({
                              videoUrl: lesson.videoUrl!,
                              title: lesson.title,
                              duration: formatDuration(lesson.durationS),
                            })
                          }
                          className="inline-flex items-center gap-1 text-primary hover:underline"
                        >
                          <Play className="h-4 w-4" />
                          Preview
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
          videoUrl={preview.videoUrl}
          title={preview.title}
          duration={preview.duration}
        />
      ) : null}
    </>
  )
}
