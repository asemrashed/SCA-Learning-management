import { LessonType } from "@/types/api"

export interface ViewableLessonFields {
  type?: LessonType
  hasVideo?: boolean
  hasDocument?: boolean
  content?: string | null
  videoUrl?: string | null
}

export function isViewableLesson(lesson: ViewableLessonFields): boolean {
  const type = lesson.type

  if (type === LessonType.TEXT) {
    return !!lesson.content?.trim()
  }
  if (type === LessonType.DOCUMENT) {
    return !!lesson.hasDocument
  }
  if (type === LessonType.RECORDED || type === LessonType.LIVE) {
    return !!lesson.hasVideo || !!lesson.videoUrl
  }

  return !!lesson.hasVideo || !!lesson.videoUrl || !!lesson.hasDocument || !!lesson.content?.trim()
}

export function isVideoLesson(lesson: ViewableLessonFields): boolean {
  if (lesson.type === LessonType.TEXT || lesson.type === LessonType.DOCUMENT) return false
  return !!lesson.hasVideo || !!lesson.videoUrl
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
