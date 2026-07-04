import { LessonType } from "@/types/api"

export interface ViewableLessonFields {
  type?: LessonType
  hasVideo?: boolean
  hasDocument?: boolean
  content?: string | null
  videoUrl?: string | null
  joinUrl?: string | null
}

export function isViewableLesson(lesson: ViewableLessonFields): boolean {
  const type = lesson.type

  if (type === LessonType.TEXT) {
    return !!lesson.content?.trim()
  }
  if (type === LessonType.DOCUMENT) {
    return !!lesson.hasDocument
  }
  if (type === LessonType.LIVE) {
    return !!lesson.joinUrl?.trim() || !!lesson.videoUrl?.trim()
  }
  if (type === LessonType.RECORDED) {
    return !!lesson.hasVideo || !!lesson.videoUrl
  }

  return (
    !!lesson.hasVideo ||
    !!lesson.videoUrl ||
    !!lesson.joinUrl?.trim() ||
    !!lesson.hasDocument ||
    !!lesson.content?.trim()
  )
}

export function isVideoLesson(lesson: ViewableLessonFields): boolean {
  if (lesson.type === LessonType.LIVE) return false
  if (lesson.type === LessonType.TEXT || lesson.type === LessonType.DOCUMENT) return false
  return !!lesson.hasVideo || !!lesson.videoUrl
}

export function isLiveLesson(lesson: ViewableLessonFields): boolean {
  return (
    lesson.type === LessonType.LIVE &&
    (!!lesson.joinUrl?.trim() || !!lesson.videoUrl?.trim())
  )
}

export function isTextLesson(lesson: ViewableLessonFields): boolean {
  return lesson.type === LessonType.TEXT && !!lesson.content?.trim()
}

export function isDocumentLesson(lesson: ViewableLessonFields): boolean {
  return lesson.type === LessonType.DOCUMENT && !!lesson.hasDocument
}

export function isPreviewableLesson(
  lesson: ViewableLessonFields & { isPreview?: boolean },
  adminMode = false,
): boolean {
  if (!isViewableLesson(lesson)) return false
  if (adminMode) return true
  return !!lesson.isPreview
}

export function liveLessonJoinUrl(lesson: ViewableLessonFields): string | null {
  const url = lesson.joinUrl?.trim() || lesson.videoUrl?.trim()
  return url || null
}
