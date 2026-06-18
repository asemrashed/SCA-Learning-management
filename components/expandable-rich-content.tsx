"use client"

import { useEffect, useRef, useState } from "react"
import { ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { RichTextContent } from "@/components/rich-text-content"
import { cn } from "@/lib/utils"

interface ExpandableRichContentProps {
  title?: string
  html: string
  collapsedMaxHeight?: number
  className?: string
}

export function ExpandableRichContent({
  title = "About this course",
  html,
  collapsedMaxHeight = 200,
  className,
}: ExpandableRichContentProps) {
  const contentRef = useRef<HTMLDivElement>(null)
  const [expanded, setExpanded] = useState(false)
  const [isOverflowing, setIsOverflowing] = useState(false)

  const trimmed = html.trim()
  if (!trimmed) return null

  useEffect(() => {
    const el = contentRef.current
    if (!el) return
    setIsOverflowing(el.scrollHeight > collapsedMaxHeight + 8)
  }, [trimmed, collapsedMaxHeight, expanded])

  return (
    <div className={cn("rounded-[20px] bg-card p-6 shadow-sm", className)}>
      <h2 className="mb-4 text-xl font-bold text-foreground">{title}</h2>
      <div className="relative">
        <div
          ref={contentRef}
          className="overflow-hidden transition-[max-height] duration-300"
          style={{ maxHeight: expanded ? undefined : collapsedMaxHeight }}
        >
          <RichTextContent html={trimmed} />
        </div>
        {!expanded && isOverflowing ? (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-card to-transparent" />
        ) : null}
      </div>
      {isOverflowing ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="mt-3 w-full gap-1 text-primary"
          onClick={() => setExpanded((v) => !v)}
        >
          {expanded ? "Show less" : "Read more"}
          <ChevronDown className={cn("h-4 w-4 transition-transform", expanded && "rotate-180")} />
        </Button>
      ) : null}
    </div>
  )
}
