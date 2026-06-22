"use client"

import Link from "next/link"
import { Plus } from "lucide-react"
import { useSelector } from "react-redux"
import type { RootState } from "@/store"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BatchCurriculum } from "@/features/batch/components/BatchCurriculum"
import { useGetCourseQuery } from "@/features/course/api"
import { useListBatchesByCourseQuery } from "@/features/batch/api"
import { BATCH_STATUS_LABEL } from "@/features/batch/utils"
import { formatBdtMinor } from "@/lib/format-currency"
import {
  BATCH,
  BATCHES,
  NEW_BATCH,
  deliveryModeLabel,
} from "@/lib/product-vocabulary"
import { DeliveryMode } from "@/types/api"
import { isSuperAdmin } from "@/lib/roles"
import { ExpandableRichContent } from "@/components/expandable-rich-content"
import { FAQAccordion } from "@/components/faq-accordion"
import { CurriculumTree } from "./curriculum-tree"

interface CourseDashboardPreviewProps {
  courseId: string
  editHref?: string
}

export function CourseDashboardPreview({
  courseId,
  editHref,
}: CourseDashboardPreviewProps) {
  const user = useSelector((state: RootState) => state.auth.user)
  const canCreateDelete = user?.role !== undefined && isSuperAdmin(user.role)
  const { data, isLoading, error } = useGetCourseQuery(courseId)
  const course = data?.data
  const isLive = course?.deliveryMode === DeliveryMode.LIVE
  const { data: batchesData } = useListBatchesByCourseQuery(courseId, { skip: !isLive })
  const batches = batchesData?.data ?? []

  if (isLoading) return <p className="text-muted-foreground">Loading course…</p>
  if (error || !course) return <p className="text-destructive">Course not found.</p>

  return (
    <div className="space-y-8">
      <div>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <Badge variant="outline">{deliveryModeLabel(course.deliveryMode)}</Badge>
              {course.category ? <Badge variant="secondary">{course.category}</Badge> : null}
            </div>
            <h1 className="text-2xl font-bold">{course.title}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {course.isPublished ? "Published" : "Draft"}
              {course.deliveryMode === DeliveryMode.RECORDED ? (
                <>
                  {" · "}
                  {course.priceMinor === 0 ? "Free" : formatBdtMinor(course.priceMinor)}
                </>
              ) : null}
            </p>
          </div>
          {editHref ? (
            <Button asChild variant="outline" className="rounded-xl">
              <Link href={editHref}>Edit course</Link>
            </Button>
          ) : null}
        </div>
      </div>

      {course.description ? (
        <ExpandableRichContent html={course.description} />
      ) : null}

      {course.faq?.length ? (
        <section className="rounded-xl border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold">Frequently Asked Questions</h2>
          <FAQAccordion items={course.faq} />
        </section>
      ) : null}

      <section>
        <h2 className="mb-4 text-lg font-semibold">Curriculum</h2>
        {isLive ? (
          <p className="text-sm text-muted-foreground">
            Curriculum is managed per batch. Edit a batch cohort to view or update its subjects and
            chapters.
          </p>
        ) : course.modules?.length ? (
          <CurriculumTree modules={course.modules} initialVisible={999} adminMode />
        ) : (
          <p className="text-sm text-muted-foreground">No curriculum yet.</p>
        )}
      </section>

      {isLive ? (
        <section>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">{BATCHES}</h2>
            {canCreateDelete ? (
              <Button asChild size="sm">
                <Link href={`/admin/courses/${course.id}/batches/new`}>
                  <Plus className="mr-1 h-4 w-4" />
                  {NEW_BATCH}
                </Link>
              </Button>
            ) : null}
          </div>
          {batches.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No cohorts yet. Add a {BATCH.toLowerCase()} for students to enroll.
            </p>
          ) : (
            <div className="overflow-hidden rounded-xl border">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-left">
                  <tr>
                    <th className="px-4 py-3 font-medium">Cohort</th>
                    <th className="px-4 py-3 font-medium">Price</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {batches.map((batch) => (
                    <tr key={batch.id} className="border-t">
                      <td className="px-4 py-3 font-medium">{batch.title}</td>
                      <td className="px-4 py-3">
                        {batch.priceMinor === 0 ? "Free" : formatBdtMinor(batch.priceMinor)}
                      </td>
                      <td className="px-4 py-3">
                        {BATCH_STATUS_LABEL[batch.status] ?? batch.status}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/admin/courses/${course.id}/edit?batchId=${batch.id}`}>
                              Curriculum
                            </Link>
                          </Button>
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/admin/batches/${batch.id}/edit`}>Edit</Link>
                          </Button>
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/admin/batches/${batch.id}/live`}>Live</Link>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      ) : null}
    </div>
  )
}
