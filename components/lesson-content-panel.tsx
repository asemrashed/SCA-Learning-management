"use client"

import { LessonDocumentViewer } from "@/components/lesson-document-viewer"
import { LessonTextViewer } from "@/components/lesson-text-viewer"
import { LessonVideoPlayer } from "@/components/lesson-video-player"
import { LessonViewerFrame } from "@/components/lesson-viewer-frame"
import {
  isDocumentLesson,
  isTextLesson,
  isVideoLesson,
  type ViewableLessonFields,
} from "@/features/enrollment/lib/lesson-view"

interface LessonContentPanelProps {
  lesson: ViewableLessonFields & { id: string; title: string }
  autoPlay?: boolean
  variant?: "default" | "modal"
}

export function LessonContentPanel({
  lesson,
  autoPlay = false,
  variant = "default",
}: LessonContentPanelProps) {
  if (isVideoLesson(lesson)) {
    return (
      <LessonViewerFrame variant="video">
        <LessonVideoPlayer
          key={lesson.id}
          lessonId={lesson.hasVideo ? lesson.id : undefined}
          videoUrl={lesson.videoUrl ?? undefined}
          title={lesson.title}
          autoPlay={autoPlay}
          flexible
          variant={variant}
          className="h-full min-h-0 flex-1"
        />
      </LessonViewerFrame>
    )
  }

  if (isTextLesson(lesson)) {
    return (
      <LessonViewerFrame variant="content">
        <LessonTextViewer
          key={lesson.id}
          title={lesson.title}
          content={lesson.content!}
        />
      </LessonViewerFrame>
    )
  }

  if (isDocumentLesson(lesson)) {
    return (
      <LessonViewerFrame variant="content">
        <LessonDocumentViewer key={lesson.id} lessonId={lesson.id} title={lesson.title} />
      </LessonViewerFrame>
    )
  }

  return (
    <LessonViewerFrame variant="content">
      <div className="flex h-full min-h-0 flex-1 items-center justify-center text-sm text-muted-foreground">
        Lesson content unavailable
      </div>
    </LessonViewerFrame>
  )
}
