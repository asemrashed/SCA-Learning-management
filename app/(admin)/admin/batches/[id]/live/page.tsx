"use client"

import Link from "next/link"
import { use } from "react"
import { Button } from "@/components/ui/button"
import { BatchSessionManager } from "@/features/liveclass/components/batch-session-manager"
import { useGetBatchQuery } from "@/features/batch/api"

export default function AdminBatchLivePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const { data, isLoading, error } = useGetBatchQuery(id)
  const batch = data?.data

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <Button variant="ghost" size="sm" asChild className="mb-4">
        <Link href={`/admin/batches/${id}`}>← Batch overview</Link>
      </Button>
      {isLoading ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : error || !batch ? (
        <p className="text-destructive">Batch not found.</p>
      ) : (
        <BatchSessionManager batchId={batch.id} batchTitle={batch.title} />
      )}
    </div>
  )
}
