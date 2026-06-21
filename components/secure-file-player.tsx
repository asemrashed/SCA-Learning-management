"use client"

import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import type { RootState } from "@/store/rootReducer"
import { fetchLessonVideoBlob, revokeBlobUrl } from "@/lib/fetch-lesson-video"
import { NativeFileVideoPlayer } from "@/components/native-file-video-player"

interface SecureFilePlayerProps {
  lessonId: string
  title: string
  autoPlay?: boolean
  flexible?: boolean
  variant?: "default" | "modal"
  className?: string
  watermarkText?: string | null
}

/** Streams a lesson file video through the authenticated API — no direct file URL on the client. */
export function SecureFilePlayer({
  lessonId,
  title,
  autoPlay,
  flexible,
  variant,
  className,
  watermarkText,
}: SecureFilePlayerProps) {
  const accessToken = useSelector((state: RootState) => state.auth.accessToken)
  const [blobUrl, setBlobUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let url: string | null = null
    void fetchLessonVideoBlob(lessonId, accessToken)
      .then((blob) => {
        url = URL.createObjectURL(blob)
        setBlobUrl(url)
      })
      .catch(() => setError("Could not load video"))

    return () => revokeBlobUrl(url)
  }, [lessonId, accessToken])

  if (error) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-muted text-sm text-muted-foreground">
        {error}
      </div>
    )
  }

  if (!blobUrl) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-muted text-sm text-muted-foreground">
        Loading video…
      </div>
    )
  }

  return (
    <NativeFileVideoPlayer
      src={blobUrl}
      title={title}
      autoPlay={autoPlay}
      flexible={flexible}
      variant={variant}
      className={className}
      watermarkText={watermarkText}
    />
  )
}
