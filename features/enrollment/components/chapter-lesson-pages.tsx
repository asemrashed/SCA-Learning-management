"use client"

import { useMemo } from "react"
import { useGetEnrollmentQuery } from "@/features/enrollment/api"
import {
  enrollmentProductId,
  enrollmentProductTitle,
  findModuleInEnrollment,
  findSubjectForModule,
} from "@/features/enrollment/curriculum"
import { LessonPageHeader } from "@/features/enrollment/components/lesson-page-header"
import {
  ModuleLessonPlayer,
  type PlayableLesson,
} from "@/features/enrollment/components/module-lesson-player"
import {
  useListBatchRecordingsQuery,
  useListCourseRecordingsQuery,
} from "@/features/liveclass/api"
import { StudentPageShell } from "@/components/student/student-page-shell"
import { EnrollmentKind, LessonType } from "@/types/api"

interface PreRecordedModuleLessonsProps {
  enrollmentId: string
  moduleId: string
}

export function PreRecordedModuleLessons({
  enrollmentId,
  moduleId,
}: PreRecordedModuleLessonsProps) {
  const { data, isLoading, error } = useGetEnrollmentQuery(enrollmentId)
  const enrollment = data?.data
  const mod = enrollment ? findModuleInEnrollment(enrollment, moduleId) : null
  const subject = enrollment ? findSubjectForModule(enrollment, moduleId) : null

  const lessons: PlayableLesson[] = useMemo(() => {
    if (!mod) return []
    return mod.lessons
      .filter((l) => l.type === LessonType.RECORDED || l.videoUrl)
      .map((l) => ({
        id: l.id,
        title: l.title,
        videoUrl: l.videoUrl,
        durationS: l.durationS,
      }))
  }, [mod])

  const courseTitle = enrollment ? enrollmentProductTitle(enrollment) : "Course"

  if (isLoading) {
    return (
      <StudentPageShell title="Pre-Recorded Class">
        <p className="text-muted-foreground">Loading…</p>
      </StudentPageShell>
    )
  }

  if (error || !enrollment || !mod) {
    return (
      <StudentPageShell title="Pre-Recorded Class">
        <p className="text-destructive">Chapter not found.</p>
      </StudentPageShell>
    )
  }

  return (
    <StudentPageShell title={courseTitle}>
      <LessonPageHeader
        sectionLabel="Pre-Recorded Class"
        subjectTitle={subject?.title ?? null}
        chapterTitle={mod.title}
        backHref={`/dashboard/courses/${enrollmentId}/pre-recorded`}
        backLabel="Back to chapters"
      />

      {lessons.length === 0 ? (
        <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
          No pre-recorded lessons in this chapter yet.
        </p>
      ) : (
        <ModuleLessonPlayer
          lessons={lessons}
          playlistTitle={mod.title}
          subjectTitle={subject?.title ?? null}
        />
      )}
    </StudentPageShell>
  )
}

interface RecordedModuleLessonsProps {
  enrollmentId: string
  moduleId: string
}

export function RecordedModuleLessons({
  enrollmentId,
  moduleId,
}: RecordedModuleLessonsProps) {
  const { data, isLoading, error } = useGetEnrollmentQuery(enrollmentId)
  const enrollment = data?.data
  const mod = enrollment ? findModuleInEnrollment(enrollment, moduleId) : null
  const subject = enrollment ? findSubjectForModule(enrollment, moduleId) : null
  const productId = enrollment ? enrollmentProductId(enrollment) : ""
  const kind = enrollment?.kind ?? EnrollmentKind.BATCH

  const batchRecordings = useListBatchRecordingsQuery(productId, {
    skip: !enrollment || kind !== EnrollmentKind.BATCH,
  })
  const courseRecordings = useListCourseRecordingsQuery(productId, {
    skip: !enrollment || kind !== EnrollmentKind.COURSE,
  })

  const recordingsQuery = kind === EnrollmentKind.BATCH ? batchRecordings : courseRecordings

  const lessons: PlayableLesson[] = useMemo(() => {
    if (!mod) return []
    const lessonIds = new Set(mod.lessons.map((l) => l.id))
    const fromRecordings = (recordingsQuery.data?.data ?? [])
      .filter((r) => r.lessonId && lessonIds.has(r.lessonId))
      .map((r) => ({
        id: r.id,
        title: r.title,
        videoUrl: r.videoUrl,
        durationS: r.durationS,
      }))

    if (fromRecordings.length > 0) return fromRecordings

    return mod.lessons
      .filter((l) => l.videoUrl)
      .map((l) => ({
        id: l.id,
        title: l.title,
        videoUrl: l.videoUrl,
        durationS: l.durationS,
      }))
  }, [mod, recordingsQuery.data])

  const courseTitle = enrollment ? enrollmentProductTitle(enrollment) : "Course"
  const loading = isLoading || recordingsQuery.isLoading

  if (loading) {
    return (
      <StudentPageShell title="Recorded Class">
        <p className="text-muted-foreground">Loading…</p>
      </StudentPageShell>
    )
  }

  if (error || !enrollment || !mod) {
    return (
      <StudentPageShell title="Recorded Class">
        <p className="text-destructive">Chapter not found.</p>
      </StudentPageShell>
    )
  }

  return (
    <StudentPageShell title={courseTitle}>
      <LessonPageHeader
        sectionLabel="Recorded Class"
        subjectTitle={subject?.title ?? null}
        chapterTitle={mod.title}
        backHref={`/dashboard/courses/${enrollmentId}/recorded`}
        backLabel="Back to chapters"
      />

      {lessons.length === 0 ? (
        <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
          No recorded lessons in this chapter yet.
        </p>
      ) : (
        <ModuleLessonPlayer
          lessons={lessons}
          playlistTitle={mod.title}
          subjectTitle={subject?.title ?? null}
        />
      )}
    </StudentPageShell>
  )
}
