"use client"

import { useEffect, useMemo, useState } from "react"
import { ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface LessonLiveViewerProps {
  title: string
  joinUrl: string
  lectureDate?: string | null
  className?: string
}

function parseLectureStart(iso: string | null | undefined): Date | null {
  if (!iso) return null
  const match = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!match) return null
  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  return new Date(year, month - 1, day, 0, 0, 0, 0)
}

function formatDisplayDate(iso: string | null | undefined): string {
  if (!iso) return ""
  const match = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!match) return iso
  return `${match[3]}/${match[2]}/${match[1]}`
}

function pad(n: number): string {
  return String(n).padStart(2, "0")
}

function useCountdown(target: Date | null) {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (!target) return
    const id = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(id)
  }, [target])

  return useMemo(() => {
    if (!target) return null
    const diffMs = target.getTime() - now
    if (diffMs <= 0) {
      return { isLive: true as const, days: 0, hours: 0, minutes: 0, seconds: 0 }
    }
    const totalSeconds = Math.floor(diffMs / 1000)
    const days = Math.floor(totalSeconds / 86400)
    const hours = Math.floor((totalSeconds % 86400) / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60
    return { isLive: false as const, days, hours, minutes, seconds }
  }, [target, now])
}

export function LessonLiveViewer({
  title,
  joinUrl,
  lectureDate,
  className,
}: LessonLiveViewerProps) {
  const startAt = useMemo(() => parseLectureStart(lectureDate), [lectureDate])
  const countdown = useCountdown(startAt)
  const dateLabel = formatDisplayDate(lectureDate)

  return (
    <div className={cn("flex h-full min-h-0 flex-col", className)}>
      <div className="shrink-0 border-b bg-muted/40 px-4 py-2">
        <p className="truncate text-sm font-medium">{title}</p>
      </div>
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-4 px-4 py-6 text-center">
        {dateLabel ? (
          <p className="text-sm text-muted-foreground">Scheduled for {dateLabel}</p>
        ) : null}

        {countdown ? (
          countdown.isLive ? (
            <p className="text-lg font-semibold text-primary">Session is live</p>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Starts in</p>
              <div className="flex flex-wrap items-center justify-center gap-2 font-mono text-2xl font-semibold tracking-tight sm:text-3xl">
                <span>{pad(countdown.days)}d</span>
                <span className="text-muted-foreground">:</span>
                <span>{pad(countdown.hours)}h</span>
                <span className="text-muted-foreground">:</span>
                <span>{pad(countdown.minutes)}m</span>
                <span className="text-muted-foreground">:</span>
                <span>{pad(countdown.seconds)}s</span>
              </div>
            </div>
          )
        ) : (
          <p className="text-sm text-muted-foreground">Join when the class starts</p>
        )}

        <Button asChild size="lg" className="mt-2">
          <a href={joinUrl} target="_blank" rel="noopener noreferrer">
            Join live class
            <ExternalLink className="ml-2 h-4 w-4" />
          </a>
        </Button>
      </div>
    </div>
  )
}
