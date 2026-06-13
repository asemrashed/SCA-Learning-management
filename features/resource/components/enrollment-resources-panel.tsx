"use client"

import Link from "next/link"
import { Download, Eye, FileText, Link2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useListResourcesQuery } from "@/features/resource/api"

function ResourceIcon({ fileType }: { fileType: string | null }) {
  const isLink = fileType === "link"
  return (
    <div
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
        isLink ? "bg-blue-100" : "bg-red-100"
      }`}
    >
      {isLink ? (
        <Link2 className="h-5 w-5 text-blue-600" />
      ) : (
        <FileText className="h-5 w-5 text-red-600" />
      )}
    </div>
  )
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

export function EnrollmentResourcesPanel({
  batchId,
  courseId,
}: {
  batchId?: string
  courseId?: string
}) {
  const { data, isLoading, error } = useListResourcesQuery({
    batchId,
    courseId,
    pageSize: 100,
    sort: "createdAt:desc",
  })

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading resources…</p>
  }
  if (error) {
    return <p className="text-sm text-destructive">Could not load resources.</p>
  }

  const items = data?.data ?? []
  if (items.length === 0) {
    return (
      <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
        No resources uploaded for this {batchId ? "batch" : "course"} yet.
      </p>
    )
  }

  return (
    <div className="divide-y rounded-xl border">
      {items.map((resource) => {
        const isLink = resource.fileType === "link"
        return (
          <div
            key={resource.id}
            className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-muted/30"
          >
            <div className="flex min-w-0 items-center gap-3">
              <ResourceIcon fileType={resource.fileType} />
              <div className="min-w-0">
                <p className="truncate font-medium">{resource.title}</p>
                <p className="text-xs text-muted-foreground">
                  Added {formatDate(resource.createdAt)}
                </p>
              </div>
            </div>
            <div className="flex shrink-0 gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href={resource.fileUrl} target="_blank" rel="noopener noreferrer">
                  <Eye className="mr-1 h-4 w-4" />
                  View
                </Link>
              </Button>
              {!isLink ? (
                <Button variant="outline" size="icon" asChild>
                  <a href={resource.fileUrl} download target="_blank" rel="noopener noreferrer">
                    <Download className="h-4 w-4" />
                  </a>
                </Button>
              ) : null}
            </div>
          </div>
        )
      })}
    </div>
  )
}
