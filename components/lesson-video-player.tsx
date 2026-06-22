"use client"

import { useSelector } from "react-redux"
import type { RootState } from "@/store/rootReducer"
import { cn } from "@/lib/utils"
import { LESSON_VIEWER_ASPECT_CLASS } from "@/components/lesson-viewer-frame"
import { resolveVideoSource } from "@/lib/video-url"
import { NativeFileVideoPlayer } from "@/components/native-file-video-player"
import { SecureLessonPlayer } from "@/components/secure-lesson-player"
import { VimeoEmbedPlayer } from "@/components/vimeo-embed-player"
import { YoutubeEmbedPlayer } from "@/components/youtube-embed-player"

interface LessonVideoPlayerProps {
  title: string
  lessonId?: string
  videoUrl?: string
  className?: string
  autoPlay?: boolean
  flexible?: boolean
  variant?: "default" | "modal"
  studentName?: string | null
  studentPhone?: string | null
}

function buildWatermarkLabel(
  studentName?: string | null,
  studentPhone?: string | null,
  fallbackName?: string | null,
  fallbackPhone?: string | null,
): string | null {
  const name = studentName ?? fallbackName
  const phone = studentPhone ?? fallbackPhone
  const label = [name, phone].filter(Boolean).join(" | ")
  return label || null
}

export function LessonVideoPlayer({
  lessonId,
  videoUrl,
  title,
  className,
  autoPlay = false,
  flexible = false,
  variant = "default",
  studentName,
  studentPhone,
}: LessonVideoPlayerProps) {
  const user = useSelector((state: RootState) => state.auth.user)
  const watermarkText = buildWatermarkLabel(
    studentName,
    studentPhone,
    user?.name,
    user?.phone,
  )

  const shared = { title, autoPlay, flexible, variant, className, watermarkText }

  if (lessonId) {
    return <SecureLessonPlayer lessonId={lessonId} {...shared} />
  }

  if (!videoUrl) {
    return (
      <div
        className={cn(
          LESSON_VIEWER_ASPECT_CLASS,
          "flex items-center justify-center bg-muted text-sm text-muted-foreground",
          flexible && "h-full min-h-0 flex-1",
          className,
        )}
      >
        Video unavailable
      </div>
    )
  }

  const source = resolveVideoSource(videoUrl)
  if (!source) {
    return (
      <div
        className={cn(
          LESSON_VIEWER_ASPECT_CLASS,
          "flex items-center justify-center bg-muted text-sm text-muted-foreground",
          flexible && "h-full min-h-0 flex-1",
          className,
        )}
      >
        Video unavailable
      </div>
    )
  }

  if (source.kind === "youtube") {
    return <YoutubeEmbedPlayer videoId={source.videoId} {...shared} />
  }
  if (source.kind === "vimeo") {
    return <VimeoEmbedPlayer videoId={source.videoId} {...shared} />
  }
  return <NativeFileVideoPlayer src={source.src} {...shared} />
}
