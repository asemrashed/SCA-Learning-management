"use client"

import { useState } from "react"
import { Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  useListAdminEnrollmentRequestsQuery,
  useReviewEnrollmentRequestMutation,
} from "@/features/enrollment/api"
import { EnrollmentKind, EnrollmentStatus } from "@/types/api"
import { LIVE_COURSE, SHOW_RECORDED_COURSES } from "@/lib/product-vocabulary"

function productTitle(item: {
  kind: EnrollmentKind
  batch: { title: string } | null
  course: { title: string } | null
}): string {
  return item.kind === EnrollmentKind.BATCH
    ? item.batch!.title
    : item.course!.title
}

export function EnrollmentRequestsPanel() {
  const { data, isLoading, error } = useListAdminEnrollmentRequestsQuery({
    status: EnrollmentStatus.PENDING,
  })
  const [reviewEnrollment, { isLoading: reviewing }] = useReviewEnrollmentRequestMutation()
  const [rollNumbers, setRollNumbers] = useState<Record<string, string>>({})
  const [actionError, setActionError] = useState<string | null>(null)

  const requests = (data?.data ?? []).filter(
    (item) => SHOW_RECORDED_COURSES || item.kind === EnrollmentKind.BATCH,
  )

  async function handleApprove(id: string) {
    const rollNumber = rollNumbers[id]?.trim()
    if (!rollNumber) {
      setActionError("Enter a roll number before approving.")
      return
    }
    setActionError(null)
    try {
      await reviewEnrollment({ id, body: { action: "approve", rollNumber } }).unwrap()
      setRollNumbers((prev) => {
        const next = { ...prev }
        delete next[id]
        return next
      })
    } catch {
      setActionError("Could not approve enrollment.")
    }
  }

  async function handleReject(id: string) {
    setActionError(null)
    try {
      await reviewEnrollment({ id, body: { action: "reject" } }).unwrap()
    } catch {
      setActionError("Could not reject enrollment.")
    }
  }

  if (isLoading) {
    return <p className="text-muted-foreground">Loading enrollment requests…</p>
  }

  if (error) {
    return <p className="text-destructive">Could not load enrollment requests.</p>
  }

  if (requests.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-10 text-center text-muted-foreground">
        No pending enrollment requests.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {actionError ? <p className="text-sm text-destructive">{actionError}</p> : null}
      {requests.map((item) => (
        <div key={item.id} className="rounded-xl border bg-card p-5">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <Badge variant="secondary">{LIVE_COURSE}</Badge>
                <Badge>{item.status}</Badge>
              </div>
              <h3 className="text-lg font-semibold">{productTitle(item)}</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {item.student.name} · {item.student.phone}
              </p>
              <p className="text-xs text-muted-foreground">
                Requested {new Date(item.enrolledAt).toLocaleString()}
              </p>
              <p className="mt-2 text-sm">
                <span className="font-medium">Enrolled:</span> {item.totalEnrollments}
                {item.totalSeats != null ? (
                  <>
                    {" "}
                    · <span className="font-medium">Seats:</span> {item.totalSeats}
                    {item.totalSeats - item.totalEnrollments > 0 ? (
                      <span className="text-muted-foreground">
                        {" "}
                        ({item.totalSeats - item.totalEnrollments} remaining)
                      </span>
                    ) : item.totalSeats - item.totalEnrollments <= 0 ? (
                      <span className="text-destructive"> (full)</span>
                    ) : null}
                  </>
                ) : null}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1">
              <label className="mb-1 block text-sm font-medium" htmlFor={`roll-${item.id}`}>
                Roll number
              </label>
              <Input
                id={`roll-${item.id}`}
                placeholder="e.g. B7-042"
                value={rollNumbers[item.id] ?? ""}
                onChange={(e) =>
                  setRollNumbers((prev) => ({ ...prev, [item.id]: e.target.value }))
                }
              />
            </div>
            <div className="flex gap-2">
              <Button
                disabled={reviewing}
                onClick={() => void handleApprove(item.id)}
              >
                <Check className="mr-2 h-4 w-4" />
                Approve
              </Button>
              <Button
                variant="outline"
                disabled={reviewing}
                onClick={() => void handleReject(item.id)}
              >
                <X className="mr-2 h-4 w-4" />
                Reject
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
