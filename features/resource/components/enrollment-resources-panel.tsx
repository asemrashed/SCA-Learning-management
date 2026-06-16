"use client"

import { FileText, Link2 } from "lucide-react"
import { useListResourcesQuery } from "@/features/resource/api"
import { ResourceViewButton } from "@/features/resource/components/resource-view-button"
import { ResourceCategory } from "@/types/api"

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

export function EnrollmentResourcesPanel({ courseId }: { courseId: string }) {
  const { data, isLoading, error } = useListResourcesQuery({
    courseId,
    category: ResourceCategory.GENERAL,
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
        No resources uploaded for this course yet.
      </p>
    )
  }

  return (
    <div className="divide-y rounded-xl border">
      {items.map((resource) => (
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
          <ResourceViewButton resource={resource} />
        </div>
      ))}
    </div>
  )
}
