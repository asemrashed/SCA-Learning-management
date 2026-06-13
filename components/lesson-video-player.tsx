"use client"

import { cn } from "@/lib/utils"
import { resolveVideoSource } from "@/lib/video-url"
import { NativeFileVideoPlayer } from "@/components/native-file-video-player"
import { VimeoEmbedPlayer } from "@/components/vimeo-embed-player"
import { YoutubeEmbedPlayer } from "@/components/youtube-embed-player"

interface LessonVideoPlayerProps {
  videoUrl: string
  title: string
  className?: string
  autoPlay?: boolean
  /** Use inside height-constrained containers (e.g. VideoModal). */
  flexible?: boolean
  variant?: "default" | "modal"
}

export function LessonVideoPlayer({
  videoUrl,
  title,
  className,
  autoPlay = false,
  flexible = false,
  variant = "default",
}: LessonVideoPlayerProps) {
  const source = resolveVideoSource(videoUrl)

  if (!source) {
    return (
      <div
        className={cn(
          "flex h-full w-full items-center justify-center bg-muted text-sm text-muted-foreground",
          className,
        )}
      >
        Video unavailable
      </div>
    )
  }

  if (source.kind === "youtube") {
    return (
      <YoutubeEmbedPlayer
        videoId={source.videoId}
        title={title}
        autoPlay={autoPlay}
        flexible={flexible}
        variant={variant}
        className={className}
      />
    )
  }

  if (source.kind === "vimeo") {
    return (
      <VimeoEmbedPlayer
        videoId={source.videoId}
        title={title}
        autoPlay={autoPlay}
        flexible={flexible}
        variant={variant}
        className={className}
      />
    )
  }

  return (
    <NativeFileVideoPlayer
      src={source.src}
      title={title}
      autoPlay={autoPlay}
      flexible={flexible}
      variant={variant}
      className={className}
    />
  )
}
