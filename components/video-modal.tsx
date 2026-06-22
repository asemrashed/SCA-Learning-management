"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { LessonContentPanel } from "@/components/lesson-content-panel"
import type { ViewableLessonFields } from "@/features/enrollment/lib/lesson-view"
import { LessonType } from "@/types/api"

export type PreviewLesson = ViewableLessonFields & { id: string; title: string }

interface VideoModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  duration?: string
  lesson?: PreviewLesson
  /** @deprecated Prefer `lesson` with full type/content fields. */
  lessonId?: string
  videoUrl?: string
}

function resolveLesson({
  lesson,
  lessonId,
  videoUrl,
  title,
}: Pick<VideoModalProps, "lesson" | "lessonId" | "videoUrl" | "title">): PreviewLesson | null {
  if (lesson) return lesson
  if (lessonId) {
    return { id: lessonId, title, type: LessonType.RECORDED, hasVideo: true }
  }
  if (videoUrl) {
    return { id: videoUrl, title, videoUrl, hasVideo: true }
  }
  return null
}

export function VideoModal({
  isOpen,
  onClose,
  title,
  duration,
  lesson,
  lessonId,
  videoUrl,
}: VideoModalProps) {
  const resolved = resolveLesson({ lesson, lessonId, videoUrl, title })
  const playerKey = resolved?.id ?? title

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        overlayClassName="z-[120]"
        className="z-[120] max-h-[calc(100vh-1.5rem)] max-w-3xl gap-0 overflow-hidden p-0 sm:max-w-3xl"
        showCloseButton
      >
        <DialogHeader className="shrink-0 border-b px-4 py-2.5 text-left">
          <DialogTitle className="pr-8 text-sm font-semibold leading-snug sm:text-base">
            {title}
            {duration ? (
              <span className="ml-2 font-normal text-muted-foreground">· {duration}</span>
            ) : null}
          </DialogTitle>
        </DialogHeader>

        <div className="w-full p-0">
          {isOpen && resolved ? (
            <LessonContentPanel
              key={playerKey}
              lesson={resolved}
              autoPlay
              variant="modal"
            />
          ) : isOpen ? (
            <div className="flex aspect-video w-full items-center justify-center bg-muted text-sm text-muted-foreground">
              Lesson content unavailable
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  )
}
