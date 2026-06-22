import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

/** Fixed 16:9 shell used by lesson video, text, and document viewers. */
export const LESSON_VIEWER_ASPECT_CLASS = "aspect-video w-full"

interface LessonViewerFrameProps {
  children: ReactNode
  className?: string
  /** Video lessons use a black shell; text/document use a light scrollable panel. */
  variant?: "video" | "content"
}

export function LessonViewerFrame({
  children,
  className,
  variant = "content",
}: LessonViewerFrameProps) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border shadow-sm",
        variant === "video" ? "bg-black" : "bg-background",
        className,
      )}
    >
      <div
        className={cn(
          LESSON_VIEWER_ASPECT_CLASS,
          "relative overflow-hidden",
          variant === "content" ? "flex flex-col" : "flex flex-col",
        )}
      >
        {children}
      </div>
    </div>
  )
}
