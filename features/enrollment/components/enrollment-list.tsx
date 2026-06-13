"use client"

import Link from "next/link"
import Image from "next/image"
import { Play, BookOpen, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useListEnrollmentsQuery } from "@/features/enrollment/api"
import { enrollmentPlayerPath } from "@/features/enrollment/utils"
import { EnrollmentKind, EnrollmentStatus } from "@/types/api"

function statusLabel(status: EnrollmentStatus, progressPct: number): string {
  if (status === EnrollmentStatus.COMPLETED || progressPct === 100) return "Completed"
  if (progressPct > 0) return "Ongoing"
  return "Not Started"
}

interface EnrollmentListProps {
  kind: EnrollmentKind
}

export function EnrollmentList({ kind }: EnrollmentListProps) {
  const { data, isLoading, error } = useListEnrollmentsQuery()

  if (isLoading) return <p className="text-muted-foreground">Loading enrollments…</p>
  if (error) {
    return (
      <p className="text-destructive">
        Could not load your {kind === EnrollmentKind.BATCH ? "batches" : "courses"}.
      </p>
    )
  }

  const items = (data?.data ?? []).filter((item) => item.kind === kind)

  if (items.length === 0) {
    const isBatch = kind === EnrollmentKind.BATCH
    return (
      <div className="py-16 text-center">
        <p className="mb-4 text-muted-foreground">
          {isBatch
            ? "You are not enrolled in any batches yet."
            : "You are not enrolled in any courses yet."}
        </p>
        <Button asChild variant="outline">
          <Link href={isBatch ? "/batches" : "/courses"}>
            {isBatch ? "Browse batches" : "Browse courses"}
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => {
        const isBatch = item.kind === EnrollmentKind.BATCH
        const title = isBatch ? item.batch!.title : item.course!.title
        const image =
          (isBatch ? item.batch!.thumbnail : item.course!.thumbnail) ??
          "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=250&fit=crop"
        const label = statusLabel(item.status, item.progressPct)
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
              <p className="mb-1 text-xs text-muted-foreground">
                {isBatch ? "Batch" : "Course"}
                {isBatch && item.batch!.instructors[0]
                  ? ` · ${item.batch!.instructors[0].name}`
                  : ""}
              </p>
              <h3 className="mb-3 line-clamp-2 font-semibold">{title}</h3>
              <div className="mb-3">
                <div className="mb-1 flex justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium">{item.progressPct}%</span>
                </div>
                <Progress value={item.progressPct} className="h-2" />
              </div>
              <p className="mb-4 flex items-center gap-1 text-xs text-muted-foreground">
                <BookOpen className="h-3.5 w-3.5" />
                {item.completedLessons}/{item.totalLessons} lessons
              </p>
              {item.nextLesson ? (
                <p className="mb-4 rounded-lg bg-muted/50 p-3 text-sm">
                  <span className="text-muted-foreground">Next: </span>
                  {item.nextLesson.title}
                </p>
              ) : null}
              {canPlay ? (
                <Button className="w-full rounded-xl" asChild>
                  <Link href={enrollmentPlayerPath(item.kind, item.id)}>
                    <Play className="mr-2 h-4 w-4" />
                    Continue
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              ) : (
                <Button className="w-full rounded-xl" disabled>
                  {item.status === EnrollmentStatus.PENDING ? "Payment pending" : "Unavailable"}
                </Button>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
