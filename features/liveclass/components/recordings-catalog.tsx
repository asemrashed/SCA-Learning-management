"use client"

import { useMemo, useState } from "react"
import { Calendar, Clock, Play, Search, Video } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { VideoModal } from "@/components/video-modal"
import {
  useListBatchRecordingsQuery,
  useListCourseRecordingsQuery,
} from "@/features/liveclass/api"
import { useListEnrollmentsQuery } from "@/features/enrollment/api"
import {
  EnrollmentKind,
  EnrollmentStatus,
  type EnrollmentListItem,
  type Recording,
} from "@/types/api"

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

type RecordingWithLabel = Recording & { productTitle: string }

function useProductRecordings(
  kind: EnrollmentKind,
  productId: string,
  productTitle: string,
): RecordingWithLabel[] {
  const batch = useListBatchRecordingsQuery(productId, {
    skip: kind !== EnrollmentKind.BATCH,
  })
  const course = useListCourseRecordingsQuery(productId, {
    skip: kind !== EnrollmentKind.COURSE,
  })
  const rows = kind === EnrollmentKind.BATCH ? batch.data?.data : course.data?.data
  return useMemo(
    () => (rows ?? []).map((r) => ({ ...r, productTitle })),
    [rows, productTitle],
  )
}

function EnrollmentRecordings({
  enrollment,
  onPlay,
}: {
  enrollment: EnrollmentListItem
  onPlay: (r: RecordingWithLabel) => void
}) {
  const productId =
    enrollment.kind === EnrollmentKind.BATCH
      ? enrollment.batch!.id
      : enrollment.course!.id
  const productTitle =
    enrollment.kind === EnrollmentKind.BATCH
      ? enrollment.batch!.title
      : enrollment.course!.title

  const recordings = useProductRecordings(enrollment.kind, productId, productTitle)
  if (recordings.length === 0) return null

  return (
    <>
      {recordings.map((recording) => (
        <RecordingCard key={recording.id} recording={recording} onPlay={onPlay} />
      ))}
    </>
  )
}

function RecordingCard({
  recording,
  onPlay,
}: {
  recording: RecordingWithLabel
  onPlay: (r: RecordingWithLabel) => void
}) {
  return (
    <div className="group overflow-hidden rounded-[20px] border bg-card shadow-sm transition-shadow hover:shadow-md">
      <button
        type="button"
        className="relative flex aspect-video w-full items-center justify-center bg-muted/60"
        onClick={() => onPlay(recording)}
      >
        <Video className="h-10 w-10 text-muted-foreground" />
        <span className="absolute bottom-3 right-3 rounded-md bg-black/70 px-2 py-0.5 text-xs text-white">
          <Clock className="mr-1 inline h-3 w-3" />
          {formatDuration(recording.durationS)}
        </span>
      </button>
      <div className="p-5">
        <p className="mb-1 text-xs text-muted-foreground">{recording.productTitle}</p>
        <h3 className="mb-2 line-clamp-2 text-lg font-semibold group-hover:text-primary">
          {recording.title}
        </h3>
        <p className="mb-4 flex items-center gap-1 text-sm text-muted-foreground">
          <Calendar className="h-3.5 w-3.5" />
          {formatDate(recording.createdAt)}
        </p>
        <Button className="w-full rounded-xl" onClick={() => onPlay(recording)}>
          <Play className="mr-2 h-4 w-4" />
          Watch
        </Button>
      </div>
    </div>
  )
}

export function RecordingsCatalog() {
  const [searchQuery, setSearchQuery] = useState("")
  const [videoModal, setVideoModal] = useState({
    isOpen: false,
    videoUrl: "",
    title: "",
    duration: "",
  })

  const { data: enrollmentsData, isLoading } = useListEnrollmentsQuery()
  const activeEnrollments = useMemo(
    () =>
      (enrollmentsData?.data ?? []).filter(
        (e) =>
          (e.status === EnrollmentStatus.ACTIVE || e.status === EnrollmentStatus.COMPLETED) &&
          ((e.kind === EnrollmentKind.BATCH && e.batch) ||
            (e.kind === EnrollmentKind.COURSE && e.course)),
      ),
    [enrollmentsData],
  )

  function openVideo(recording: RecordingWithLabel) {
    setVideoModal({
      isOpen: true,
      videoUrl: recording.videoUrl,
      title: recording.title,
      duration: formatDuration(recording.durationS),
    })
  }

  return (
    <div>
      <VideoModal
        isOpen={videoModal.isOpen}
        onClose={() => setVideoModal((p) => ({ ...p, isOpen: false }))}
        videoUrl={videoModal.videoUrl}
        title={videoModal.title}
        duration={videoModal.duration}
      />

      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search recordings…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="rounded-xl pl-10"
          />
        </div>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Loading recordings…</p>
      ) : activeEnrollments.length === 0 ? (
        <div className="py-16 text-center">
          <Video className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No enrollments yet</h3>
          <p className="text-muted-foreground">Enroll in a batch or course to see recordings.</p>
        </div>
      ) : (
        <RecordingsGrid
          enrollments={activeEnrollments}
          searchQuery={searchQuery}
          onPlay={openVideo}
        />
      )}
    </div>
  )
}

function RecordingsGrid({
  enrollments,
  searchQuery,
  onPlay,
}: {
  enrollments: EnrollmentListItem[]
  searchQuery: string
  onPlay: (r: RecordingWithLabel) => void
}) {
  const allRecordings = enrollments.flatMap((enrollment) => (
    <EnrollmentRecordings key={enrollment.id} enrollment={enrollment} onPlay={onPlay} />
  ))

  if (searchQuery) {
    return (
      <FilteredRecordings enrollments={enrollments} searchQuery={searchQuery} onPlay={onPlay} />
    )
  }

  const hasAny = enrollments.length > 0
  if (!hasAny) {
    return (
      <div className="py-16 text-center">
        <Video className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">No recordings yet</h3>
        <p className="text-muted-foreground">
          Recordings from your enrolled batches and courses will appear here.
        </p>
      </div>
    )
  }

  return <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">{allRecordings}</div>
}

function FilteredRecordings({
  enrollments,
  searchQuery,
  onPlay,
}: {
  enrollments: EnrollmentListItem[]
  searchQuery: string
  onPlay: (r: RecordingWithLabel) => void
}) {
  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {enrollments.map((enrollment) => (
        <SearchableEnrollmentRecordings
          key={enrollment.id}
          enrollment={enrollment}
          searchQuery={searchQuery}
          onPlay={onPlay}
        />
      ))}
    </div>
  )
}

function SearchableEnrollmentRecordings({
  enrollment,
  searchQuery,
  onPlay,
}: {
  enrollment: EnrollmentListItem
  searchQuery: string
  onPlay: (r: RecordingWithLabel) => void
}) {
  const productId =
    enrollment.kind === EnrollmentKind.BATCH
      ? enrollment.batch!.id
      : enrollment.course!.id
  const productTitle =
    enrollment.kind === EnrollmentKind.BATCH
      ? enrollment.batch!.title
      : enrollment.course!.title

  const recordings = useProductRecordings(enrollment.kind, productId, productTitle)
  const filtered = recordings.filter(
    (r) =>
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.productTitle.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <>
      {filtered.map((recording) => (
        <RecordingCard key={recording.id} recording={recording} onPlay={onPlay} />
      ))}
    </>
  )
}
