"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { FileText, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useListEnrollmentsQuery } from "@/features/enrollment/api"
import { useListResourcesQuery } from "@/features/resource/api"
import { ResourceViewButton } from "@/features/resource/components/resource-view-button"
import { EnrollmentKind, EnrollmentStatus, ResourceCategory } from "@/types/api"

function ResourceIcon({ fileType }: { fileType: string | null }) {
  const isLink = fileType === "link"
  return (
    <div
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
        isLink ? "bg-blue-100" : "bg-red-100"
      }`}
    >
      <FileText className={`h-5 w-5 ${isLink ? "text-blue-600" : "text-red-600"}`} />
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

function ScopeResources({
  courseId,
  productTitle,
  search,
}: {
  courseId: string
  productTitle: string
  search: string
}) {
  const { data, isLoading, error } = useListResourcesQuery({
    courseId,
    category: ResourceCategory.GENERAL,
    search: search || undefined,
    pageSize: 100,
    sort: "createdAt:desc",
  })

  if (isLoading) {
    return <p className="px-5 py-4 text-sm text-muted-foreground">Loading resources…</p>
  }
  if (error) {
    return <p className="px-5 py-4 text-sm text-destructive">Could not load resources.</p>
  }

  const items = data?.data ?? []
  if (items.length === 0) {
    return (
      <p className="px-5 py-8 text-center text-sm text-muted-foreground">
        No resources available yet.
      </p>
    )
  }

  const standalone = items.filter((r) => !r.moduleId && !r.lessonId)
  const placed = items.filter((r) => r.moduleId || r.lessonId)

  return (
    <div className="divide-y divide-border">
      {standalone.length > 0 ? (
        <div>
          <div className="bg-muted/50 px-5 py-3">
            <h3 className="font-medium text-foreground">{productTitle} — General</h3>
          </div>
          {standalone.map((resource) => (
            <ResourceRow key={resource.id} resource={resource} productTitle={productTitle} />
          ))}
        </div>
      ) : null}
      {placed.map((resource) => (
        <ResourceRow key={resource.id} resource={resource} productTitle={productTitle} />
      ))}
    </div>
  )
}

function ResourceRow({
  resource,
  productTitle,
}: {
  resource: {
    id: string
    title: string
    fileUrl: string | null
    fileType: string | null
    createdAt: string
  }
  productTitle: string
}) {
  return (
    <div className="flex items-center justify-between px-5 py-4 hover:bg-muted/30 transition-colors">
      <div className="flex items-center gap-3">
        <ResourceIcon fileType={resource.fileType} />
        <div>
          <p className="font-medium text-foreground">{resource.title}</p>
          <p className="text-sm text-muted-foreground">
            {productTitle} • Added {formatDate(resource.createdAt)}
          </p>
        </div>
      </div>
      <ResourceViewButton resource={resource} className="rounded-xl" />
    </div>
  )
}

export function ResourceList() {
  const [searchQuery, setSearchQuery] = useState("")
  const { data: enrollmentData, isLoading, error } = useListEnrollmentsQuery()

  const activeEnrollments = useMemo(
    () =>
      (enrollmentData?.data ?? []).filter(
        (e) =>
          e.status === EnrollmentStatus.ACTIVE || e.status === EnrollmentStatus.COMPLETED,
      ),
    [enrollmentData],
  )

  if (isLoading) {
    return <p className="text-muted-foreground">Loading your resources…</p>
  }
  if (error) {
    return <p className="text-destructive">Could not load enrollments.</p>
  }

  if (activeEnrollments.length === 0) {
    return (
      <div className="py-16 text-center">
        <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold text-foreground">No resources yet</h3>
        <p className="mb-4 text-muted-foreground">Enroll in a course or batch to access materials.</p>
        <Button asChild variant="outline">
          <Link href="/courses">Browse courses</Link>
        </Button>
      </div>
    )
  }

  return (
    <div>
      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search resources..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 rounded-xl"
        />
      </div>

      <div className="space-y-6">
        {activeEnrollments.map((enrollment) => {
          const isBatch = enrollment.kind === EnrollmentKind.BATCH
          const courseId = isBatch
            ? enrollment.batch!.course.id
            : enrollment.course!.id
          const title = isBatch
            ? `${enrollment.batch!.course.title} · ${enrollment.batch!.title}`
            : enrollment.course!.title

          return (
            <div
              key={enrollment.id}
              className="overflow-hidden rounded-[20px] border border-border bg-card"
            >
              <div className="flex items-center justify-between border-b border-border bg-muted/50 px-5 py-3">
                <div>
                  <h2 className="font-semibold text-foreground">{title}</h2>
                </div>
              </div>
              <ScopeResources
                courseId={courseId}
                productTitle={title}
                search={searchQuery}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
