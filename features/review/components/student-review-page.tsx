"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Star } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { StudentPageShell } from "@/components/student/student-page-shell"
import { useListEnrollmentsQuery } from "@/features/enrollment/api"
import { useListMyReviewsQuery, useSubmitReviewMutation } from "@/features/review/api"
import { EnrollmentKind, EnrollmentListItem, EnrollmentStatus, ReviewStatus } from "@/types/api"

interface ReviewableEnrollment {
  enrollmentId: string
  courseId: string
  courseTitle: string
  batchId: string | null
  batchTitle: string | null
  label: string
}

function enrollmentCourseId(item: EnrollmentListItem): string {
  return item.kind === EnrollmentKind.COURSE
    ? item.course!.id
    : item.batch!.course.id
}

function buildReviewableEnrollments(enrollments: EnrollmentListItem[] | undefined): ReviewableEnrollment[] {
  if (!enrollments?.length) return []

  return enrollments
    .filter((item: EnrollmentListItem) => item.status === EnrollmentStatus.ACTIVE)
    .map((item: EnrollmentListItem) => {
      const courseId = enrollmentCourseId(item)
      const courseTitle =
        item.kind === EnrollmentKind.BATCH
          ? item.batch?.course?.title ?? item.batch?.title ?? "Course"
          : item.course?.title ?? "Course"
      const batchId = item.kind === EnrollmentKind.BATCH ? item.batch?.id ?? null : null
      const batchTitle = item.kind === EnrollmentKind.BATCH ? item.batch?.title ?? null : null
      const label =
        item.kind === EnrollmentKind.BATCH
          ? `${courseTitle} · ${batchTitle ?? "Batch"}`
          : courseTitle

      return {
        enrollmentId: item.id,
        courseId,
        courseTitle,
        batchId,
        batchTitle,
        label,
      }
    })
}

export function StudentReviewPage() {
  const searchParams = useSearchParams()
  const presetEnrollmentId = searchParams.get("enrollmentId")

  const { data: enrollmentsData, isLoading: enrollmentsLoading } = useListEnrollmentsQuery()
  const { data: myReviewsData, isLoading: reviewsLoading } = useListMyReviewsQuery()
  const [submitReview, { isLoading: submitting }] = useSubmitReviewMutation()

  const reviewable = useMemo(
    () => buildReviewableEnrollments(enrollmentsData?.data),
    [enrollmentsData],
  )

  const courseOptions = useMemo(() => {
    const map = new Map<string, { courseId: string; courseTitle: string }>()
    for (const item of reviewable) {
      if (!map.has(item.courseId)) {
        map.set(item.courseId, { courseId: item.courseId, courseTitle: item.courseTitle })
      }
    }
    return [...map.values()]
  }, [reviewable])

  const [courseId, setCourseId] = useState("")
  const [batchId, setBatchId] = useState("")
  const [text, setText] = useState("")
  const [formError, setFormError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const batchOptions = useMemo(
    () => reviewable.filter((item) => item.courseId === courseId && item.batchId),
    [reviewable, courseId],
  )

  const selectedEnrollment = useMemo(() => {
    if (!courseId) return null
    if (batchOptions.length > 0) {
      return batchOptions.find((item) => item.batchId === batchId) ?? null
    }
    return reviewable.find((item) => item.courseId === courseId && !item.batchId) ?? null
  }, [reviewable, courseId, batchId, batchOptions])

  const existingReview = useMemo(() => {
    if (!courseId) return null
    return myReviewsData?.data.find((review) => review.courseId === courseId) ?? null
  }, [myReviewsData, courseId])

  useEffect(() => {
    if (!presetEnrollmentId || reviewable.length === 0) return
    const preset = reviewable.find((item) => item.enrollmentId === presetEnrollmentId)
    if (!preset) return
    setCourseId(preset.courseId)
    setBatchId(preset.batchId ?? "")
    if (existingReview?.text) setText(existingReview.text)
  }, [presetEnrollmentId, reviewable, existingReview?.text])

  useEffect(() => {
    if (existingReview?.text && !text) {
      setText(existingReview.text)
    }
  }, [existingReview, text])

  useEffect(() => {
    setBatchId("")
  }, [courseId])

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!selectedEnrollment) {
      setFormError("Select a course and batch you are enrolled in.")
      return
    }
    if (existingReview?.status === ReviewStatus.ACTIVE) {
      setFormError("Your review for this course is already published.")
      return
    }
    const trimmed = text.trim()
    if (trimmed.length < 10) {
      setFormError("Please write at least 10 characters.")
      return
    }

    setFormError(null)
    setSuccessMessage(null)
    try {
      await submitReview({
        courseId: selectedEnrollment.courseId,
        batchId: selectedEnrollment.batchId ?? undefined,
        enrollmentId: selectedEnrollment.enrollmentId,
        text: trimmed,
      }).unwrap()
      setSuccessMessage(
        existingReview
          ? "Review updated. It will appear on the home page after admin approval."
          : "Review submitted. It will appear on the home page after admin approval.",
      )
    } catch {
      setFormError("Could not submit your review. Please try again.")
    }
  }

  const isLoading = enrollmentsLoading || reviewsLoading

  if (isLoading) {
    return (
      <StudentPageShell title="Review">
        <p className="text-muted-foreground">Loading…</p>
      </StudentPageShell>
    )
  }

  if (reviewable.length === 0) {
    return (
      <StudentPageShell title="Review">
        <div className="rounded-xl border border-dashed p-10 text-center text-muted-foreground">
          <Star className="mx-auto mb-3 h-8 w-8 text-primary" />
          <p>You need an active enrollment before you can leave a review.</p>
          <Button asChild className="mt-4 rounded-lg bg-secondary text-primary hover:bg-secondary/90">
            <Link href="/dashboard/courses">Browse my courses</Link>
          </Button>
        </div>
      </StudentPageShell>
    )
  }

  return (
    <StudentPageShell title="Review">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground md:text-3xl">Share your experience</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Reviews are linked to the course. Choose the course and batch you enrolled in, then
            tell us about your learning journey. Your review will appear on the home page only
            after an admin approves it.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border bg-card p-6">
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="review-course">Course</Label>
              <Select value={courseId} onValueChange={setCourseId}>
                <SelectTrigger id="review-course" className="rounded-lg">
                  <SelectValue placeholder="Select a course" />
                </SelectTrigger>
                <SelectContent>
                  {courseOptions.map((course) => (
                    <SelectItem key={course.courseId} value={course.courseId}>
                      {course.courseTitle}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {batchOptions.length > 0 ? (
              <div className="space-y-2">
                <Label htmlFor="review-batch">Batch</Label>
                <Select value={batchId} onValueChange={setBatchId}>
                  <SelectTrigger id="review-batch" className="rounded-lg">
                    <SelectValue placeholder="Select a batch" />
                  </SelectTrigger>
                  <SelectContent>
                    {batchOptions.map((item) => (
                      <SelectItem key={item.enrollmentId} value={item.batchId!}>
                        {item.batchTitle}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : null}
          </div>

          {existingReview ? (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-muted-foreground">Current status:</span>
              <Badge variant={existingReview.status === ReviewStatus.ACTIVE ? "default" : "secondary"}>
                {existingReview.status === ReviewStatus.ACTIVE
                  ? "Published"
                  : existingReview.status === ReviewStatus.HIDDEN
                    ? "Hidden"
                    : "Pending approval"}
              </Badge>
            </div>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="review-text">Your review</Label>
            <Textarea
              id="review-text"
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder="Tell us about your experience with this course…"
              rows={6}
              className="rounded-xl"
              disabled={existingReview?.status === ReviewStatus.ACTIVE}
            />
          </div>

          {formError ? <p className="text-sm text-destructive">{formError}</p> : null}
          {successMessage ? <p className="text-sm text-primary">{successMessage}</p> : null}

          <Button
            type="submit"
            disabled={
              submitting ||
              !selectedEnrollment ||
              existingReview?.status === ReviewStatus.ACTIVE
            }
            className="rounded-lg bg-secondary text-primary hover:bg-secondary/90"
          >
            {existingReview ? "Update review" : "Submit review"}
          </Button>
        </form>
      </div>
    </StudentPageShell>
  )
}
