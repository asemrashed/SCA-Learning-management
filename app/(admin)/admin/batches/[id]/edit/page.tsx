"use client"

import { use } from "react"
import { BatchAdminForm } from "@/features/batch/components/batch-admin-form"

export default function EditBatchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  return (
    <div className="px-4 py-10">
      <BatchAdminForm batchId={id} />
    </div>
  )
}
