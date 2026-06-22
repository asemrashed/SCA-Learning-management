"use client"

import { RichTextContent } from "@/components/rich-text-content"
import { cn } from "@/lib/utils"

interface LessonTextViewerProps {
  title: string
  content: string
  className?: string
}

export function LessonTextViewer({ title, content, className }: LessonTextViewerProps) {
  return (
    <div className={cn("flex h-full min-h-0 flex-col", className)}>
      <div className="shrink-0 border-b bg-muted/40 px-4 py-2">
        <p className="truncate text-sm font-medium">{title}</p>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        <RichTextContent html={content} />
      </div>
    </div>
  )
}
