"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { MediaSourceField } from "@/components/media-source-field"
import { Textarea } from "@/components/ui/textarea"
import {
  useListBatchAssignmentsQuery,
  useSubmitAssignmentMutation,
} from "@/features/assessment/api"
import { EnrollmentKind } from "@/types/api"

export function AssignmentListPanel({
  kind,
  scopeId,
}: {
  kind: EnrollmentKind
  scopeId: string
}) {
  const { data, isLoading, error, refetch } = useListBatchAssignmentsQuery(scopeId, {
    skip: kind !== EnrollmentKind.BATCH,
  })
  const [submitAssignment, { isLoading: submitting }] = useSubmitAssignmentMutation()
  const [drafts, setDrafts] = useState<Record<string, { text: string; fileUrl: string }>>({})

  if (kind !== EnrollmentKind.BATCH) {
    return (
      <p className="text-sm text-muted-foreground">
        Course assignments appear in your enrollment when assigned by your instructor.
      </p>
    )
  }

  const assignments = data?.data ?? []

  async function handleSubmit(assignmentId: string) {
    const draft = drafts[assignmentId] ?? { text: "", fileUrl: "" }
    await submitAssignment({
      assignmentId,
      body: {
        text: draft.text || null,
        fileUrl: draft.fileUrl || null,
      },
    }).unwrap()
    refetch()
  }

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading assignments…</p>
  if (error) return <p className="text-sm text-destructive">Could not load assignments.</p>
  if (!assignments.length) {
    return <p className="text-sm text-muted-foreground">No assignments yet.</p>
  }

  return (
    <ul className="space-y-4">
      {assignments.map((a) => {
        const draft = drafts[a.id] ?? { text: "", fileUrl: "" }
        const graded = a.submission?.gradedAt
        return (
          <li key={a.id} className="rounded-lg border p-4">
            <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-medium">{a.title}</p>
                {a.description ? (
                  <p className="mt-1 text-sm text-muted-foreground">{a.description}</p>
                ) : null}
                <p className="mt-1 text-xs text-muted-foreground">
                  {a.totalMarks} marks
                  {a.dueAt ? ` · Due ${new Date(a.dueAt).toLocaleString()}` : ""}
                </p>
              </div>
              {a.submission ? (
                <div className="text-sm">
                  <p className="text-muted-foreground">
                    Submitted {new Date(a.submission.submittedAt).toLocaleString()}
                  </p>
                  {graded ? (
                    <p className="font-medium text-green-700">
                      {a.submission.scoreMarks ?? 0} / {a.totalMarks} marks
                    </p>
                  ) : (
                    <p className="text-muted-foreground">Awaiting grade</p>
                  )}
                  {a.submission.feedback ? (
                    <p className="mt-1 text-muted-foreground">{a.submission.feedback}</p>
                  ) : null}
                </div>
              ) : null}
            </div>

            {!a.submission ? (
              <div className="mt-3 space-y-3">
                <div className="space-y-2">
                  <Label htmlFor={`text-${a.id}`}>Your answer</Label>
                  <Textarea
                    id={`text-${a.id}`}
                    value={draft.text}
                    onChange={(e) =>
                      setDrafts((d) => ({
                        ...d,
                        [a.id]: { ...draft, text: e.target.value },
                      }))
                    }
                  />
                </div>
                <MediaSourceField
                  label="Attachment (optional)"
                  value={draft.fileUrl}
                  onChange={(url) =>
                    setDrafts((d) => ({
                      ...d,
                      [a.id]: { ...draft, fileUrl: url },
                    }))
                  }
                  folder="documents"
                  accept=".pdf,.doc,.docx,.zip,application/pdf,image/*"
                  placeholder="https://…"
                  compact
                />
                <Button
                  size="sm"
                  disabled={submitting}
                  onClick={() => void handleSubmit(a.id)}
                >
                  Submit assignment
                </Button>
              </div>
            ) : null}
          </li>
        )
      })}
    </ul>
  )
}
