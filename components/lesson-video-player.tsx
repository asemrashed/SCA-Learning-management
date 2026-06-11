"use client"

import { cn } from "@/lib/utils"
import { resolveVideoSource } from "@/lib/video-url"
import { VimeoEmbedPlayer } from "@/components/vimeo-embed-player"
import { YoutubeEmbedPlayer } from "@/components/youtube-embed-player"

interface LessonVideoPlayerProps {
  videoUrl: string
  title: string
  className?: string
  autoPlay?: boolean
}

export function LessonVideoPlayer({
  videoUrl,
  title,
  className,
  autoPlay = false,
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
        className={className}
      />
    )
  }

  return (
    <video
      src={source.src}
      title={title}
      className={cn("h-full w-full bg-black", className)}
      controls
      controlsList="nodownload noremoteplayback"
      disablePictureInPicture
      playsInline
      autoPlay={autoPlay}
      onContextMenu={(e) => e.preventDefault()}
    />
  )
}
