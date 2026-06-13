"use client"

import { Badge } from "@/components/ui/badge"
import { Radio, Video } from "lucide-react"
import {
  useListBatchSessionsQuery,
  useListCourseSessionsQuery,
} from "@/features/liveclass/api"
import { SessionJoinButton } from "@/features/liveclass/components/session-join-button"
import { EnrollmentKind, SessionStatus, type LiveSession } from "@/types/api"

function formatScheduled(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  })
}

function statusVariant(status: SessionStatus): "default" | "secondary" | "outline" | "destructive" {
  switch (status) {
    case SessionStatus.LIVE:
      return "destructive"
    case SessionStatus.SCHEDULED:
      return "default"
    case SessionStatus.ENDED:
      return "secondary"
    default:
      return "outline"
  }
}

function SessionRow({ session }: { session: LiveSession }) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <h3 className="font-semibold">{session.title}</h3>
          <Badge variant={statusVariant(session.status)}>{session.status}</Badge>
        </div>
        <p className="text-sm text-muted-foreground">{formatScheduled(session.scheduledAt)}</p>
        {session.recording ? (
          <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
            <Video className="h-3.5 w-3.5" />
            Recording available
          </p>
        ) : null}
      </div>
      <SessionJoinButton session={session} />
    </div>
  )
}

export function LiveSessionsPanel({
  kind,
  productId,
}: {
  kind: EnrollmentKind
  productId: string
}) {
  const batchQuery = useListBatchSessionsQuery(productId, {
    skip: kind !== EnrollmentKind.BATCH,
  })
  const courseQuery = useListCourseSessionsQuery(productId, {
    skip: kind !== EnrollmentKind.COURSE,
  })

  const { data, isLoading, error } =
    kind === EnrollmentKind.BATCH ? batchQuery : courseQuery
  const sessions = data?.data ?? []

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading live sessions…</p>
  }
  if (error) {
    return null
  }
  if (sessions.length === 0) {
    return null
  }

  return (
    <section className="space-y-3">
      <h2 className="flex items-center gap-2 text-lg font-semibold">
        <Radio className="h-5 w-5" />
        Live classes
      </h2>
      <div className="space-y-3">
        {sessions.map((session) => (
          <SessionRow key={session.id} session={session} />
        ))}
      </div>
    </section>
  )
}
