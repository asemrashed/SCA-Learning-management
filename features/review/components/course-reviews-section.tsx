"use client"

import { useState } from "react"
import { ReviewCard } from "@/components/review-card"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { useListPublicReviewsQuery } from "@/features/review/api"
import type { ReviewPublicItem } from "@/types/api"
import { cn } from "@/lib/utils"

const PAGE_SIZE = 5

function initialsFromName(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
}

function toCardProps(review: ReviewPublicItem) {
  return {
    name: review.studentName,
    review: review.text,
    course: review.courseTitle,
    batch: review.batchTitle ?? undefined,
    image: review.studentAvatarUrl ?? undefined,
    initials: review.studentAvatarUrl ? undefined : initialsFromName(review.studentName),
  }
}

interface CourseReviewsSectionProps {
  courseId: string
}

export function CourseReviewsSection({ courseId }: CourseReviewsSectionProps) {
  const [page, setPage] = useState(1)

  const { data, isLoading, isFetching, error } = useListPublicReviewsQuery({
    courseId,
    page,
    pageSize: PAGE_SIZE,
  })

  const reviews = data?.data ?? []
  const meta = data?.meta
  const totalPages = meta ? Math.max(1, Math.ceil(meta.total / meta.pageSize)) : 1

  return (
    <section className="rounded-[20px] bg-card p-6 shadow-sm">
      <h2 className="mb-4 text-xl font-bold text-foreground">Student reviews</h2>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading reviews…</p>
      ) : error ? (
        <p className="text-sm text-destructive">Could not load reviews.</p>
      ) : reviews.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No reviews for this course yet. Be the first to share your experience.
        </p>
      ) : (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {reviews.map((review) => (
              <ReviewCard key={review.id} {...toCardProps(review)} />
            ))}
          </div>

          {meta && meta.total > PAGE_SIZE ? (
            <div className="flex flex-col items-center gap-3 border-t pt-4 sm:flex-row sm:justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {(meta.page - 1) * meta.pageSize + 1}–
                {Math.min(meta.page * meta.pageSize, meta.total)} of {meta.total}
                {isFetching ? " · Updating…" : ""}
              </p>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      className={cn(page <= 1 && "pointer-events-none opacity-50")}
                      onClick={(e) => {
                        e.preventDefault()
                        if (page > 1) setPage((p) => p - 1)
                      }}
                    />
                  </PaginationItem>
                  <PaginationItem>
                    <span className="px-3 text-sm text-muted-foreground">
                      Page {page} of {totalPages}
                    </span>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      className={cn(page >= totalPages && "pointer-events-none opacity-50")}
                      onClick={(e) => {
                        e.preventDefault()
                        if (page < totalPages) setPage((p) => p + 1)
                      }}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          ) : null}
        </div>
      )}
    </section>
  )
}
