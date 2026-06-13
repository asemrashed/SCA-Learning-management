"use client"

import { useMemo, useState } from "react"
import { Calendar, Clock, Play, Video } from "lucide-react"
import { Button } from "@/components/ui/button"
import { VideoModal } from "@/components/video-modal"
import {
  useListBatchRecordingsQuery,
  useListCourseRecordingsQuery,
} from "@/features/liveclass/api"
import { EnrollmentKind, type Recording } from "@/types/api"

function formatDuration(seconds: number | null): string {
  if (!seconds) return "—"
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
  return `${m}:${String(s).padStart(2, "0")}`
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

export function EnrollmentRecordingsPanel({
  kind,
  productId,
}: {
  kind: EnrollmentKind
  productId: string
}) {
  const [videoModal, setVideoModal] = useState({
    isOpen: false,
    videoUrl: "",
    title: "",
    duration: "",
  })

  const batch = useListBatchRecordingsQuery(productId, {
    skip: kind !== EnrollmentKind.BATCH,
  })
  const course = useListCourseRecordingsQuery(productId, {
    skip: kind !== EnrollmentKind.COURSE,
  })

  const recordings: Recording[] = useMemo(() => {
    if (kind === EnrollmentKind.BATCH) return batch.data?.data ?? []
    return course.data?.data ?? []
  }, [kind, batch.data, course.data])

  const isLoading = kind === EnrollmentKind.BATCH ? batch.isLoading : course.isLoading
  const error = kind === EnrollmentKind.BATCH ? batch.error : course.error

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading recordings…</p>
  }
  if (error) {
    return <p className="text-sm text-destructive">Could not load recordings.</p>
  }
  if (recordings.length === 0) {
    return (
      <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
        No recordings available yet.
      </p>
    )
  }

  function openVideo(recording: Recording) {
    setVideoModal({
      isOpen: true,
      videoUrl: recording.videoUrl,
      title: recording.title,
      duration: formatDuration(recording.durationS),
    })
  }

  return (
    <>
      <VideoModal
        isOpen={videoModal.isOpen}
        onClose={() => setVideoModal((p) => ({ ...p, isOpen: false }))}
        videoUrl={videoModal.videoUrl}
        title={videoModal.title}
        duration={videoModal.duration}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        {recordings.map((recording) => (
          <div
            key={recording.id}
            className="overflow-hidden rounded-xl border bg-card shadow-sm"
          >
            <button
              type="button"
              className="relative flex aspect-video w-full items-center justify-center bg-muted/60"
              onClick={() => openVideo(recording)}
            >
              <Video className="h-10 w-10 text-muted-foreground" />
              <span className="absolute bottom-2 right-2 rounded bg-black/70 px-2 py-0.5 text-xs text-white">
                <Clock className="mr-1 inline h-3 w-3" />
                {formatDuration(recording.durationS)}
              </span>
            </button>
            <div className="p-4">
              <h3 className="mb-2 line-clamp-2 font-semibold">{recording.title}</h3>
              <p className="mb-3 flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                {formatDate(recording.createdAt)}
              </p>
              <Button className="w-full rounded-xl" size="sm" onClick={() => openVideo(recording)}>
                <Play className="mr-2 h-4 w-4" />
                Watch
              </Button>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
