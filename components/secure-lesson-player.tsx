"use client"

import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import type { RootState } from "@/store/rootReducer"
import { cn } from "@/lib/utils"
import { LESSON_VIEWER_ASPECT_CLASS } from "@/components/lesson-viewer-frame"
import { fetchLessonPlayMeta, type LessonPlayKind } from "@/lib/fetch-lesson-video"
import { ServerEmbedPlayer } from "@/components/server-embed-player"
import { SecureFilePlayer } from "@/components/secure-file-player"

interface SecureLessonPlayerProps {
  lessonId: string
  title: string
  className?: string
  autoPlay?: boolean
  flexible?: boolean
  variant?: "default" | "modal"
  watermarkText?: string | null
}

/** Resolves lesson playback via server APIs — never receives the raw video URL. */
export function SecureLessonPlayer({
  lessonId,
  title,
  className,
  autoPlay = false,
  flexible = false,
  variant = "default",
  watermarkText,
}: SecureLessonPlayerProps) {
  const accessToken = useSelector((state: RootState) => state.auth.accessToken)
  const [kind, setKind] = useState<LessonPlayKind | null>(null)
  const [resolvedTitle, setResolvedTitle] = useState(title)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setKind(null)
    setError(null)
    void fetchLessonPlayMeta(lessonId, accessToken)
      .then((meta) => {
        setKind(meta.kind)
        setResolvedTitle(meta.title || title)
      })
      .catch(() => setError("Video unavailable"))
  }, [lessonId, accessToken, title])

  if (error) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-muted text-sm text-muted-foreground",
          flexible ? "h-full min-h-0 w-full flex-1" : LESSON_VIEWER_ASPECT_CLASS,
          className,
        )}
      >
        {error}
      </div>
    )
  }

  if (!kind) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-muted text-sm text-muted-foreground",
          flexible ? "h-full min-h-0 w-full flex-1" : LESSON_VIEWER_ASPECT_CLASS,
          className,
        )}
      >
        Loading video…
      </div>
    )
  }

  const shared = {
    title: resolvedTitle,
    autoPlay,
    flexible,
    variant,
    className,
    watermarkText,
  }

  if (kind === "youtube" || kind === "vimeo") {
    return <ServerEmbedPlayer lessonId={lessonId} kind={kind} {...shared} />
  }

  return <SecureFilePlayer lessonId={lessonId} {...shared} />
}
