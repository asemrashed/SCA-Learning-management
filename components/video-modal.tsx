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
  videoUrl: string
  title: string
  duration?: string
}

/** Modal wrapper — same LessonVideoPlayer as dashboard, sized to fit the viewport without scrolling. */
export function VideoModal({
  isOpen,
  onClose,
  videoUrl,
  title,
  duration,
}: VideoModalProps) {
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
            key={videoUrl}
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
