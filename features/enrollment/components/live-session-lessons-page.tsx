"use client"

import { useMemo } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useGetEnrollmentQuery } from "@/features/enrollment/api"
import { enrollmentProductId, enrollmentProductTitle } from "@/features/enrollment/curriculum"
import {
  ModuleLessonPlayer,
  type PlayableLesson,
} from "@/features/enrollment/components/module-lesson-player"
import {
  useListBatchRecordingsQuery,
  useListBatchSessionsQuery,
  useListCourseRecordingsQuery,
  useListCourseSessionsQuery,
} from "@/features/liveclass/api"
import { StudentPageShell } from "@/components/student/student-page-shell"
import { EnrollmentKind } from "@/types/api"

export function LiveSessionLessonsPage({
  enrollmentId,
  sessionId,
}: {
  enrollmentId: string
  sessionId: string
}) {
  const { data, isLoading, error } = useGetEnrollmentQuery(enrollmentId)
  const enrollment = data?.data
  const productId = enrollment ? enrollmentProductId(enrollment) : ""
  const kind = enrollment?.kind ?? EnrollmentKind.BATCH

  const batchSessions = useListBatchSessionsQuery(productId, {
    skip: !enrollment || kind !== EnrollmentKind.BATCH,
  })
  const courseSessions = useListCourseSessionsQuery(productId, {
    skip: !enrollment || kind !== EnrollmentKind.COURSE,
  })
  const sessionsQuery = kind === EnrollmentKind.BATCH ? batchSessions : courseSessions

  const batchRecordings = useListBatchRecordingsQuery(productId, {
    skip: !enrollment || kind !== EnrollmentKind.BATCH,
  })
  const courseRecordings = useListCourseRecordingsQuery(productId, {
    skip: !enrollment || kind !== EnrollmentKind.COURSE,
  })
  const recordingsQuery = kind === EnrollmentKind.BATCH ? batchRecordings : courseRecordings

  const session = useMemo(
    () => sessionsQuery.data?.data.find((s) => s.id === sessionId) ?? null,
    [sessionsQuery.data, sessionId],
  )

  const lessons: PlayableLesson[] = useMemo(() => {
    const recordings = recordingsQuery.data?.data ?? []

    if (session?.recording) {
      const playlist: PlayableLesson[] = [
        {
          id: session.recording.id,
          title: session.recording.title,
          videoUrl: session.recording.videoUrl,
          durationS: session.recording.durationS,
        },
      ]
      for (const r of recordings) {
        if (r.id !== session.recording.id) {
          playlist.push({
            id: r.id,
            title: r.title,
            videoUrl: r.videoUrl,
            durationS: r.durationS,
          })
        }
      }
      return playlist
    }

    return recordings.map((r) => ({
      id: r.id,
      title: r.title,
      videoUrl: r.videoUrl,
      durationS: r.durationS,
    }))
  }, [session, recordingsQuery.data])

  const courseTitle = enrollment ? enrollmentProductTitle(enrollment) : "Course"
  const loading = isLoading || sessionsQuery.isLoading || recordingsQuery.isLoading

  if (loading) {
    return (
      <StudentPageShell title="Live Class Link">
        <p className="text-muted-foreground">Loading…</p>
      </StudentPageShell>
    )
  }

  if (error || !enrollment || !session) {
    return (
      <StudentPageShell title="Live Class Link">
        <p className="text-destructive">Live class not found.</p>
      </StudentPageShell>
    )
  }

  return (
    <StudentPageShell title={courseTitle}>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">Live Class</p>
          <h1 className="text-2xl font-bold">{session.title}</h1>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href={`/dashboard/courses/${enrollmentId}/live-class`}>Back to live classes</Link>
        </Button>
      </div>

      {lessons.length === 0 ? (
        <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
          No lesson recordings available for this live class yet.
        </p>
      ) : (
        <ModuleLessonPlayer
          lessons={lessons}
          playlistTitle="Recordings"
          initialLessonId={session.recording?.id}
        />
      )}
    </StudentPageShell>
  )
}
