"use client"

import { use } from "react"
import { BatchDashboardPreview } from "@/features/batch/components/batch-dashboard-preview"

export default function AdminBatchDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <BatchDashboardPreview
        batchId={id}
        backHref="/admin/batches"
        backLabel="Manage batches"
        liveManageHref={`/admin/batches/${id}/live`}
      />
    </div>
  )
}
