"use client"

import Link from "next/link"
import { BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { BatchCurriculum } from "@/features/batch/components/BatchCurriculum"
import { useGetBatchQuery, useGetBatchCurriculumQuery } from "@/features/batch/api"
import { BATCH_STATUS_LABEL } from "@/features/batch/utils"
import { BATCH } from "@/lib/product-vocabulary"
import { LiveSessionsPanel } from "@/features/liveclass/components/live-sessions-panel"
import { formatBdtMinor } from "@/lib/format-currency"
import { EnrollmentKind } from "@/types/api"

interface BatchDashboardPreviewProps {
  batchId: string
  liveManageHref: string
}

export function BatchDashboardPreview({
  batchId,
  liveManageHref,
}: BatchDashboardPreviewProps) {
  const { data, isLoading, error } = useGetBatchQuery(batchId)
  const batch = data?.data
  const { data: curriculumData } = useGetBatchCurriculumQuery(batchId, { skip: !batch })
  const subjects = curriculumData?.data ?? []

  if (isLoading) return <p className="text-muted-foreground">Loading {BATCH.toLowerCase()}…</p>
  if (error || !batch) return <p className="text-destructive">{BATCH} not found.</p>

  return (
    <div className="space-y-8">
      <div>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">{batch.title}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {BATCH_STATUS_LABEL[batch.status] ?? batch.status} ·{" "}
              {batch.priceMinor === 0 ? "Free" : formatBdtMinor(batch.priceMinor)}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Course:{" "}
              <Link href={`/admin/courses/${batch.course.id}`} className="text-primary hover:underline">
                {batch.course.title}
              </Link>
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" className="rounded-xl">
              <Link href={`/admin/courses/${batch.course.id}/edit?batchId=${batchId}`}>
                <BookOpen className="mr-1 h-4 w-4" />
                Edit curriculum
              </Link>
            </Button>
            <Button asChild variant="outline" className="rounded-xl">
              <Link href={liveManageHref}>Manage live classes</Link>
            </Button>
          </div>
        </div>
      </div>

      <LiveSessionsPanel kind={EnrollmentKind.BATCH} productId={batch.id} />

      {subjects.length ? (
        <section>
          <h2 className="mb-4 text-lg font-semibold">Curriculum</h2>
          <BatchCurriculum subjects={subjects} adminMode />
        </section>
      ) : null}
    </div>
  )
}
