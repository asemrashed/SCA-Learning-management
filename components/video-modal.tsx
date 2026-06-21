"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { LessonVideoPlayer } from "@/components/lesson-video-player"

interface VideoModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  duration?: string
  lessonId?: string
  videoUrl?: string
}

export function VideoModal({
  isOpen,
  onClose,
  title,
  duration,
  lessonId,
  videoUrl,
}: VideoModalProps) {
  const playerKey = lessonId ?? videoUrl ?? title

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

        {isOpen ? (
          <LessonVideoPlayer
            key={playerKey}
            lessonId={lessonId}
            videoUrl={videoUrl}
            title={title}
            autoPlay
            variant="modal"
          />
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
