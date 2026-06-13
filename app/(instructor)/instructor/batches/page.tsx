"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatBdtMinor } from "@/lib/format-currency"
import { useListBatchesQuery } from "@/features/batch/api"

export default function InstructorBatchesPage() {
  const { data, isLoading, error } = useListBatchesQuery({ pageSize: 50, sort: "startDate:desc" })
  const batches = data?.data ?? []

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground md:text-3xl">My batches</h1>
        <p className="text-muted-foreground">Batches you are assigned to as an instructor.</p>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Loading batches…</p>
      ) : error ? (
        <p className="text-destructive">Could not load batches.</p>
      ) : batches.length === 0 ? (
        <p className="text-muted-foreground">No assigned batches yet. Ask an admin to add you.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {batches.map((batch) => (
                <tr key={batch.id} className="border-b last:border-0">
                  <td className="px-4 py-3 font-medium">{batch.title}</td>
                  <td className="px-4 py-3">
                    <Badge variant="outline">{batch.status}</Badge>
                  </td>
                  <td className="px-4 py-3">{formatBdtMinor(batch.priceMinor)}</td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="outline" size="sm" asChild className="mr-2">
                      <Link href={`/instructor/batches/${batch.id}`}>View</Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild className="mr-2">
                      <Link href={`/instructor/batches/${batch.id}/live`}>Live</Link>
                    </Button>
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
