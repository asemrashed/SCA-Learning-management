"use client"

import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog"
import { LessonVideoPlayer } from "@/components/lesson-video-player"

interface VideoModalProps {
  isOpen: boolean
  onClose: () => void
  videoUrl: string
  title: string
  duration?: string
}

export function VideoModal({
  isOpen,
  onClose,
  videoUrl,
  title,
  duration,
}: VideoModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl gap-0 overflow-hidden p-0 sm:max-w-4xl">
        {isOpen ? (
          <LessonVideoPlayer videoUrl={videoUrl} title={title} autoPlay />
        ) : null}
        {duration ? (
          <p className="border-t px-4 py-2 text-sm text-muted-foreground">Duration: {duration}</p>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
