"use client"

import { use } from "react"
import { LiveSessionLessonsPage } from "@/features/enrollment/components/live-session-lessons-page"

export default function LiveSessionLessonsRoute({
  params,
}: {
  params: Promise<{ id: string; sessionId: string }>
}) {
  const { id, sessionId } = use(params)
  return <LiveSessionLessonsPage enrollmentId={id} sessionId={sessionId} />
}
