"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { BatchCurriculum } from "@/features/batch/components/BatchCurriculum"
import { useGetBatchQuery } from "@/features/batch/api"
import { BATCH_STATUS_LABEL } from "@/features/batch/utils"
import { LiveSessionsPanel } from "@/features/liveclass/components/live-sessions-panel"
import { formatBdtMinor } from "@/lib/format-currency"
import { EnrollmentKind } from "@/types/api"

interface BatchDashboardPreviewProps {
  batchId: string
  liveManageHref: string
  backHref: string
  backLabel?: string
}

export function BatchDashboardPreview({
  batchId,
  liveManageHref,
  backHref,
  backLabel = "Back",
}: BatchDashboardPreviewProps) {
  const { data, isLoading, error } = useGetBatchQuery(batchId)
  const batch = data?.data

  if (isLoading) return <p className="text-muted-foreground">Loading batch…</p>
  if (error || !batch) return <p className="text-destructive">Batch not found.</p>

  return (
    <div className="space-y-8">
      <div>
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link href={backHref}>← {backLabel}</Link>
        </Button>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">{batch.title}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {BATCH_STATUS_LABEL[batch.status] ?? batch.status} ·{" "}
              {batch.priceMinor === 0 ? "Free" : formatBdtMinor(batch.priceMinor)}
            </p>
          </div>
          <Button asChild variant="outline" className="rounded-xl">
            <Link href={liveManageHref}>Manage live classes</Link>
          </Button>
        </div>
      </div>

      <LiveSessionsPanel kind={EnrollmentKind.BATCH} productId={batch.id} />

      <section>
        <h2 className="mb-4 text-lg font-semibold">Curriculum</h2>
        <BatchCurriculum subjects={batch.subjects} />
      </section>
    </div>
  )
}
