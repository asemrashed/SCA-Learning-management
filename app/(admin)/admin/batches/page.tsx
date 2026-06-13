"use client"

import Link from "next/link"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatBdtMinor } from "@/lib/format-currency"
import { useListBatchesQuery, useDeleteBatchMutation } from "@/features/batch/api"
import { BATCH_STATUS_LABEL } from "@/features/batch/utils"

export default function AdminBatchesPage() {
  const { data, isLoading, error } = useListBatchesQuery({
    pageSize: 50,
    sort: "createdAt:desc",
  })
  const [deleteBatch] = useDeleteBatchMutation()

  const batches = data?.data ?? []

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Manage batches</h1>
          <p className="text-sm text-muted-foreground">
            Create and edit cohort batches (Subject → Module → Lesson)
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/admin/courses">Courses</Link>
          </Button>
          <Button asChild>
            <Link href="/admin/batches/new">
              <Plus className="mr-2 h-4 w-4" />
              New batch
            </Link>
          </Button>
        </div>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : error ? (
        <p className="text-destructive">Could not load batches. Sign in as admin.</p>
      ) : batches.length === 0 ? (
        <p className="text-muted-foreground">No batches yet.</p>
      ) : (
        <div className="overflow-hidden rounded-xl border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {batches.map((batch) => (
                <tr key={batch.id} className="border-t">
                  <td className="px-4 py-3">
                    <div className="font-medium">{batch.title}</div>
                    <div className="text-xs text-muted-foreground">{batch.slug}</div>
                  </td>
                  <td className="px-4 py-3">
                    {batch.priceMinor === 0 ? "Free" : formatBdtMinor(batch.priceMinor)}
                  </td>
                  <td className="px-4 py-3">
                    {BATCH_STATUS_LABEL[batch.status] ?? batch.status}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/admin/batches/${batch.id}/edit`}>Edit</Link>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/admin/batches/${batch.id}`}>View</Link>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/admin/batches/${batch.id}/live`}>Live</Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                        onClick={() => {
                          if (confirm("Delete this batch?")) {
                            void deleteBatch(batch.id)
                          }
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
