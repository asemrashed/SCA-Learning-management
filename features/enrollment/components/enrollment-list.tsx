"use client"

import Link from "next/link"
import Image from "next/image"
import { Play, BookOpen, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useListEnrollmentsQuery } from "@/features/enrollment/api"
import { enrollmentPlayerPath } from "@/features/enrollment/utils"
import {
  BROWSE_COURSES,
  COURSE,
  COURSE_CATALOG_HREF,
  LIVE_BATCH_CATALOG_HREF,
  deliveryModeLabel,
} from "@/lib/product-vocabulary"
import { EnrollmentKind, EnrollmentStatus } from "@/types/api"

function statusLabel(status: EnrollmentStatus): string {
  if (status === EnrollmentStatus.COMPLETED) return "Completed"
  if (status === EnrollmentStatus.PENDING) return "Pending approval"
  if (status === EnrollmentStatus.CANCELLED) return "Rejected"
  return "Active"
}

interface EnrollmentListProps {
  kind: EnrollmentKind
}

export function EnrollmentList({ kind }: EnrollmentListProps) {
  const { data, isLoading, error } = useListEnrollmentsQuery()

  if (isLoading) return <p className="text-muted-foreground">Loading enrollments…</p>
  if (error) {
    return <p className="text-destructive">Could not load your enrollments.</p>
  }

  const items = (data?.data ?? []).filter((item) => item.kind === kind)

  if (items.length === 0) {
    const isBatch = kind === EnrollmentKind.BATCH
    return (
      <div className="py-16 text-center">
        <p className="mb-4 text-muted-foreground">
          {isBatch
            ? "You are not enrolled in any live batches yet."
            : `You are not enrolled in any recorded ${COURSE.toLowerCase()}s yet.`}
        </p>
        <Button asChild variant="outline">
          <Link href={isBatch ? LIVE_BATCH_CATALOG_HREF : COURSE_CATALOG_HREF}>
            {isBatch ? "Browse live batches" : BROWSE_COURSES}
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => {
        const isBatch = item.kind === EnrollmentKind.BATCH
        const title = isBatch ? item.batch!.course.title : item.course!.title
        const subtitle = isBatch ? item.batch!.title : deliveryModeLabel(item.deliveryMode)
        const image =
          (isBatch ? item.batch!.thumbnail : item.course!.thumbnail) ??
          "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=250&fit=crop"
        const label = statusLabel(item.status)
        const canPlay =
          item.status === EnrollmentStatus.ACTIVE ||
          item.status === EnrollmentStatus.COMPLETED

        return (
          <div
            key={item.id}
            className="overflow-hidden rounded-[20px] border border-border bg-card shadow-sm"
          >
            <div className="relative aspect-video">
              <Image src={image} alt={title} fill className="object-cover" />
              <Badge className="absolute left-3 top-3">{label}</Badge>
            </div>
            <div className="p-5">
              <p className="mb-1 text-xs text-muted-foreground">{subtitle}</p>
              <h3 className="mb-3 line-clamp-2 font-semibold">{title}</h3>
              {item.rollNumber ? (
                <p className="mb-4 text-sm text-muted-foreground">Roll: {item.rollNumber}</p>
              ) : null}
              {canPlay ? (
                <Button className="w-full rounded-xl" asChild>
                  <Link href={enrollmentPlayerPath(item.kind, item.id)}>
                    <Play className="mr-2 h-4 w-4" />
                    Open
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              ) : (
                <Button className="w-full rounded-xl" disabled>
                  {item.status === EnrollmentStatus.PENDING
                    ? "Awaiting admin approval"
                    : "Unavailable"}
                </Button>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
