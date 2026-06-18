"use client"

import { ArrowRight } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { cn } from "@/lib/utils"
import type { LiveClassSchedule } from "@/types/api"
import { formatScheduleDay, formatTimeRange } from "@/features/liveclass/lib/schedule-format"

interface LiveClassJoinDialogProps {
  schedule: LiveClassSchedule
  triggerClassName?: string
}

export function LiveClassJoinDialog({ schedule, triggerClassName }: LiveClassJoinDialogProps) {
  const canJoin = Boolean(schedule.joinUrl)

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <button
          type="button"
          disabled={!canJoin}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-md bg-emerald-600 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50",
            triggerClassName,
          )}
        >
          View lesson
          <ArrowRight className="h-4 w-4" />
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Join live class</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-2 text-left text-sm text-muted-foreground">
              <p>
                <span className="font-medium text-foreground">{schedule.subject}</span>
              </p>
              <p>{formatScheduleDay(schedule)}</p>
              <p>{formatTimeRange(schedule.startTime, schedule.endTime)}</p>
              {schedule.passcode ? (
                <p>
                  Passcode:{" "}
                  <span className="font-mono font-medium text-foreground">{schedule.passcode}</span>
                </p>
              ) : null}
              {canJoin ? (
                <p>You will open the meeting link in a new tab.</p>
              ) : (
                <p>Meeting link is not available yet.</p>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          {canJoin ? (
            <AlertDialogAction asChild>
              <a href={schedule.joinUrl} target="_blank" rel="noopener noreferrer">
                Join class
              </a>
            </AlertDialogAction>
          ) : null}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
