"use client"

import { ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SessionStatus, type LiveSession } from "@/types/api"

export function SessionJoinButton({
  session,
  size = "sm",
  className,
}: {
  session: LiveSession
  size?: "sm" | "default"
  className?: string
}) {
  const canJoin =
    session.joinUrl &&
    (session.status === SessionStatus.LIVE || session.status === SessionStatus.SCHEDULED)

  if (!canJoin) return null

  return (
    <Button asChild size={size} className={className ?? "rounded-xl"}>
      <a href={session.joinUrl!} target="_blank" rel="noopener noreferrer">
        <ExternalLink className="mr-2 h-4 w-4" />
        {session.status === SessionStatus.LIVE ? "Join live" : "Open join link"}
      </a>
    </Button>
  )
}
