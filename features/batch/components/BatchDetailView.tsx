"use client"

import { useState } from "react"
import Image from "next/image"
import { AppLoading } from "@/components/status/app-loading"
import { AppNotFound } from "@/components/status/app-not-found"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { VideoModal } from "@/components/video-modal"
import { formatBdtMinor } from "@/lib/format-currency"
import { useGetBatchQuery, useGetBatchCurriculumQuery } from "@/features/batch/api"
import { BatchCurriculum } from "@/features/batch/components/BatchCurriculum"
import { BATCH_STATUS_LABEL, daysUntil, formatBatchDate, formatDuration } from "@/features/batch/utils"
import { BATCH, BROWSE_COURSES, LIVE_BATCH_CATALOG_HREF } from "@/lib/product-vocabulary"
import { EnrollButton } from "@/features/enrollment/components/enroll-button"
import { Calendar, Clock, Play } from "lucide-react"
import { motion } from "framer-motion"

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?w=800&h=450&fit=crop"

interface BatchDetailViewProps {
  idOrSlug: string
}

export function BatchDetailView({ idOrSlug }: BatchDetailViewProps) {
  const { data, isLoading, isError } = useGetBatchQuery(idOrSlug)
  const batch = data?.data
  const { data: curriculumData } = useGetBatchCurriculumQuery(batch?.id ?? "", {
    skip: !batch?.id,
  })
  const subjects = curriculumData?.data ?? []
  const [previewOpen, setPreviewOpen] = useState(false)

  if (isLoading) {
    return (
      <main className="py-8">
        <div className="container mx-auto px-4">
          <AppLoading message={`Loading ${BATCH.toLowerCase()}…`} />
        </div>
      </main>
    )
  }

  if (isError || !batch) {
    return (
      <main className="py-8">
        <div className="container mx-auto px-4">
          <AppNotFound
            title={`${BATCH} not found`}
            description={`This cohort may have been removed or is not yet published.`}
            backHref={LIVE_BATCH_CATALOG_HREF}
            backLabel={BROWSE_COURSES}
          />
        </div>
      </main>
    )
  }

  const daysLeft = daysUntil(batch.registrationDeadline)
  const isLive = batch.status === "ACTIVE"
  const previewLessons = subjects.flatMap((s) =>
    (s.modules ?? []).flatMap((m) => (m.lessons ?? []).filter((l) => l.isPreview && l.videoUrl)),
  )
  const previewLesson = previewLessons[0]

  return (
    <>
      <main className="py-8">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="space-y-8 lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-[24px] bg-gradient-to-br from-primary/10 via-accent/5 to-background p-6 md:p-8"
              >
                {isLive && <Badge className="mb-4 bg-destructive">Live now</Badge>}
                <h1 className="mb-2 text-2xl font-bold text-foreground md:text-3xl lg:text-4xl">
                  {batch.title}
                </h1>
                {batch.course ? (
                  <p className="mb-4 text-sm text-muted-foreground">{batch.course.title}</p>
                ) : null}

                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <Badge variant="outline">{BATCH_STATUS_LABEL[batch.status]}</Badge>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {formatBatchDate(batch.startDate)} – {formatBatchDate(batch.endDate)}
                  </span>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="rounded-[20px] bg-card p-6 shadow-sm"
              >
                <h2 className="mb-4 text-xl font-bold text-foreground">Curriculum</h2>
                <BatchCurriculum subjects={subjects} />
              </motion.div>
            </div>

            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="sticky top-24 rounded-[20px] bg-card p-6 shadow-lg"
              >
                <div className="relative mb-6 aspect-video overflow-hidden rounded-xl">
                  <Image
                    src={batch.thumbnail || FALLBACK_IMAGE}
                    alt={batch.title}
                    fill
                    className="object-cover"
                  />
                  {previewLesson && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                      <Button
                        size="lg"
                        className="rounded-full"
                        onClick={() => setPreviewOpen(true)}
                      >
                        <Play className="mr-2 h-5 w-5" />
                        Preview
                      </Button>
                    </div>
                  )}
                </div>

                <div className="mb-6">
                  <span className="text-3xl font-bold text-foreground">
                    {batch.priceMinor === 0 ? "Free" : formatBdtMinor(batch.priceMinor)}
                  </span>
                </div>

                <div className="mb-6 space-y-3">
                  {batch.capacity != null && (
                    <div className="flex items-center justify-between rounded-xl bg-accent/10 px-4 py-3">
                      <span className="text-sm text-accent">Capacity</span>
                      <span className="font-medium text-accent">{batch.capacity} seats</span>
                    </div>
                  )}
                  {daysLeft != null && (
                    <div className="flex items-center justify-between rounded-xl bg-primary/10 px-4 py-3">
                      <span className="text-sm text-primary">Registration</span>
                      <span className="font-medium text-primary">
                        {daysLeft > 0 ? `${daysLeft} days left` : "Closing soon"}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between rounded-xl bg-muted/50 px-4 py-3">
                    <span className="text-sm text-muted-foreground">Starts</span>
                    <span className="font-medium">{formatBatchDate(batch.startDate)}</span>
                  </div>
                </div>

                <EnrollButton
                  batchId={batch.id}
                  productTitle={batch.title}
                  className="mb-3 w-full rounded-xl text-lg"
                />

                <div className="mt-6 space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>Cohort-based live program</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Play className="h-4 w-4" />
                    <span>
                      {previewLessons.length > 0
                        ? `${previewLessons.length} free preview lesson(s)`
                        : "Enroll to unlock all lessons"}
                    </span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </main>

      {previewLesson ? (
        <VideoModal
          isOpen={previewOpen}
          onClose={() => setPreviewOpen(false)}
          videoUrl={previewLesson.videoUrl!}
          title={previewLesson.title}
          duration={formatDuration(previewLesson.durationS ?? null)}
        />
      ) : null}
    </>
  )
}
