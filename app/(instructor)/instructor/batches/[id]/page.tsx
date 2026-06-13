"use client"

import { use } from "react"
import { BatchDashboardPreview } from "@/features/batch/components/batch-dashboard-preview"

export default function InstructorBatchDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)

  return (
    <div className="p-6 md:p-8">
      <BatchDashboardPreview
        batchId={id}
        backHref="/instructor/batches"
        backLabel="My batches"
        liveManageHref={`/instructor/batches/${id}/live`}
      />
    </div>
  )
}
