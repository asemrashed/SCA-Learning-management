"use client"

import { Play } from "lucide-react"
import { cn } from "@/lib/utils"

interface VideoPrePlayOverlayProps {
  title: string
  thumbnailSrc?: string
  onStart: () => void
  className?: string
}

/** Shown before the iframe/video mounts — delays URL exposure until user intent. */
export function VideoPrePlayOverlay({
  title,
  thumbnailSrc,
  onStart,
  className,
}: VideoPrePlayOverlayProps) {
  return (
    <button
      type="button"
      aria-label={`Play ${title}`}
      onClick={onStart}
      className={cn(
        "group absolute inset-0 z-20 flex flex-col items-center justify-center",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset",
        className,
      )}
    >
      {thumbnailSrc ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={thumbnailSrc}
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full scale-105 object-cover opacity-35 blur-sm pointer-events-none select-none"
        />
      ) : null}
      <div className="absolute inset-0 bg-black/60 pointer-events-none" />
      <p className="relative z-10 mb-6 line-clamp-2 max-w-md px-8 text-center text-sm font-medium text-white/80 drop-shadow-md">
        {title}
      </p>
      <span className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full bg-primary/90 text-primary-foreground shadow-lg transition group-hover:scale-105 group-active:scale-95">
        <Play className="ml-1 h-8 w-8" fill="currentColor" />
      </span>
    </button>
  )
}
