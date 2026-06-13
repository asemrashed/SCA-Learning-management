"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MediaSourceField } from "@/components/media-source-field"
import { SessionJoinButton } from "@/features/liveclass/components/session-join-button"
import {
  useCreateRecordingMutation,
  useCreateSessionMutation,
  useListBatchSessionsQuery,
  useUpdateSessionMutation,
} from "@/features/liveclass/api"
import { SessionStatus } from "@/types/api"

export function BatchSessionManager({ batchId, batchTitle }: { batchId: string; batchTitle: string }) {
  const { data, isLoading } = useListBatchSessionsQuery(batchId)
  const [createSession, { isLoading: creating }] = useCreateSessionMutation()
  const [updateSession] = useUpdateSessionMutation()
  const [createRecording, { isLoading: savingRecording }] = useCreateRecordingMutation()

  const [title, setTitle] = useState("")
  const [scheduledAt, setScheduledAt] = useState("")
  const [joinUrl, setJoinUrl] = useState("")

  const [recordingFor, setRecordingFor] = useState<string | null>(null)
  const [recordingTitle, setRecordingTitle] = useState("")
  const [recordingUrl, setRecordingUrl] = useState("")

  const sessions = data?.data ?? []
  const scopeKey = `batch-${batchId}`

  async function handleSchedule(e: React.FormEvent) {
    e.preventDefault()
    if (!title || !scheduledAt) return
    await createSession({
      batchId,
      title,
      scheduledAt: new Date(scheduledAt).toISOString(),
      joinUrl: joinUrl || undefined,
    }).unwrap()
    setTitle("")
    setScheduledAt("")
    setJoinUrl("")
  }

  async function setLive(sessionId: string) {
    await updateSession({
      id: sessionId,
      body: { status: SessionStatus.LIVE },
      scopeKey,
    })
  }

  async function endSession(sessionId: string) {
    await updateSession({
      id: sessionId,
      body: { status: SessionStatus.ENDED },
      scopeKey,
    })
  }

  async function saveRecording(sessionId: string) {
    if (!recordingTitle || !recordingUrl) return
    await createRecording({
      sessionId,
      batchId,
      title: recordingTitle,
      videoUrl: recordingUrl,
    }).unwrap()
    setRecordingFor(null)
    setRecordingTitle("")
    setRecordingUrl("")
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold">{batchTitle}</h2>
        <p className="text-sm text-muted-foreground">Schedule and manage live sessions</p>
      </div>

      <form onSubmit={(e) => void handleSchedule(e)} className="max-w-lg space-y-4 rounded-xl border p-4">
        <h3 className="font-medium">Schedule session</h3>
        <div className="space-y-2">
          <Label htmlFor={`title-${batchId}`}>Title</Label>
          <Input
            id={`title-${batchId}`}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`when-${batchId}`}>Scheduled at</Label>
          <Input
            id={`when-${batchId}`}
            type="datetime-local"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`join-${batchId}`}>Join URL (Zoom/Meet link)</Label>
          <Input
            id={`join-${batchId}`}
            type="url"
            placeholder="https://…"
            value={joinUrl}
            onChange={(e) => setJoinUrl(e.target.value)}
          />
        </div>
        <Button type="submit" disabled={creating} className="rounded-xl">
          {creating ? "Scheduling…" : "Schedule"}
        </Button>
      </form>

      {isLoading ? (
        <p className="text-muted-foreground">Loading sessions…</p>
      ) : sessions.length === 0 ? (
        <p className="text-muted-foreground">No sessions scheduled yet.</p>
      ) : (
        <div className="space-y-4">
          {sessions.map((session) => (
            <div key={session.id} className="rounded-xl border p-4">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="font-medium">{session.title}</span>
                <Badge variant="outline">{session.status}</Badge>
              </div>
              <p className="mb-3 text-sm text-muted-foreground">
                {new Date(session.scheduledAt).toLocaleString()}
              </p>
              <div className="flex flex-wrap items-center gap-2">
                {session.status === SessionStatus.SCHEDULED ? (
                  <Button size="sm" variant="outline" onClick={() => void setLive(session.id)}>
                    Mark live
                  </Button>
                ) : null}
                {session.status === SessionStatus.LIVE ? (
                  <Button size="sm" variant="outline" onClick={() => void endSession(session.id)}>
                    End session
                  </Button>
                ) : null}
                <SessionJoinButton session={session} />
                {session.status === SessionStatus.ENDED && !session.recording ? (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      setRecordingFor(session.id)
                      setRecordingTitle(session.title)
                    }}
                  >
                    Add recording
                  </Button>
                ) : null}
              </div>
              {recordingFor === session.id ? (
                <div className="mt-4 space-y-3 rounded-lg bg-muted/40 p-3">
                  <Input
                    placeholder="Recording title"
                    value={recordingTitle}
                    onChange={(e) => setRecordingTitle(e.target.value)}
                  />
                  <MediaSourceField
                    label="Recording video"
                    value={recordingUrl}
                    onChange={setRecordingUrl}
                    folder="videos"
                    accept="video/*"
                    placeholder="https://…"
                    compact
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      disabled={savingRecording}
                      onClick={() => void saveRecording(session.id)}
                    >
                      Save recording
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setRecordingFor(null)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : null}
              {session.recording ? (
                <p className="mt-2 text-xs text-green-700">Recording published</p>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
