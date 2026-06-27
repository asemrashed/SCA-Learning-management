"use client"

import { useState } from "react"
import Image from "next/image"
import { AppLoading } from "@/components/status/app-loading"
import { AppNotFound } from "@/components/status/app-not-found"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { VideoModal } from "@/components/video-modal"
import { FAQAccordion } from "@/components/faq-accordion"
import { ExpandableRichContent } from "@/components/expandable-rich-content"
import { formatBdtMinor } from "@/lib/format-currency"
import { useGetBatchQuery, useGetBatchCurriculumQuery } from "@/features/batch/api"
import { BatchCurriculum } from "@/features/batch/components/BatchCurriculum"
import { BATCH_STATUS_LABEL, daysUntil, formatBatchDate, formatDuration } from "@/features/batch/utils"
import { BATCH, BROWSE_COURSES, LIVE_BATCH_CATALOG_HREF } from "@/lib/product-vocabulary"
import {
  MARKETING_COVER_HERO_HEIGHT,
  MARKETING_NAV_CLEARANCE,
  marketingHeroSection,
} from "@/lib/marketing-layout"
import { cn } from "@/lib/utils"
import { EnrollButton } from "@/features/enrollment/components/enroll-button"
import { isPreviewableLesson } from "@/features/enrollment/lib/lesson-view"
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
      <main className={`overflow-x-hidden py-8 ${MARKETING_NAV_CLEARANCE}`}>
        <div className="container mx-auto max-w-full px-4">
          <AppLoading message={`Loading ${BATCH.toLowerCase()}…`} />
        </div>
      </main>
    )
  }

  if (isError || !batch) {
    return (
      <main className={`overflow-x-hidden py-8 ${MARKETING_NAV_CLEARANCE}`}>
        <div className="container mx-auto max-w-full px-4">
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
    (s.modules ?? []).flatMap((m) =>
      (m.lessons ?? []).filter((l) => isPreviewableLesson(l)),
    ),
  )
  const previewLesson = previewLessons[0]

  return (
    <>
      <main className="overflow-x-hidden py-8">
        <div className="container mx-auto max-w-full px-4">
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="order-2 space-y-8 lg:order-1 lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "rounded-[24px] bg-gradient-to-br from-primary/10 via-accent/5 to-background p-6 md:p-8",
                  marketingHeroSection("max-lg:mt-0 max-lg:pt-0"),
                )}
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

              {batch.course?.description ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 }}
                >
                  <ExpandableRichContent html={batch.course.description} />
                </motion.div>
              ) : null}

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="rounded-[20px] bg-card p-6 shadow-sm"
              >
                <h2 className="mb-4 text-xl font-bold text-foreground">Curriculum</h2>
                <BatchCurriculum subjects={subjects} />
              </motion.div>

              {batch.course?.faq?.length ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="rounded-[20px] bg-card p-6 shadow-sm"
                >
                  <h2 className="mb-4 text-xl font-bold text-foreground">
                    Frequently Asked Questions
                  </h2>
                  <FAQAccordion items={batch.course.faq} />
                </motion.div>
              ) : null}
            </div>

            <div
              className={cn(
                "order-1 lg:order-2 lg:col-span-1",
                marketingHeroSection("lg:mt-0 lg:pt-0"),
              )}
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-[20px] bg-card p-6 shadow-lg lg:sticky lg:top-24"
              >
                <div
                  className={cn(
                    "relative mb-6 min-h-[200px] overflow-hidden rounded-xl",
                    MARKETING_COVER_HERO_HEIGHT,
                  )}
                >
                  <Image
                    src={batch.thumbnail || FALLBACK_IMAGE}
                    alt={batch.title}
                    fill
                    priority
                    className="object-cover"
                  />
                  {previewLesson ? (
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
                  ) : null}
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
          lesson={{
            id: previewLesson.id,
            title: previewLesson.title,
            type: previewLesson.type,
            hasVideo: previewLesson.hasVideo,
            hasDocument: previewLesson.hasDocument,
            content: previewLesson.content ?? null,
            videoUrl: previewLesson.videoUrl ?? null,
          }}
          title={previewLesson.title}
          duration={formatDuration(previewLesson.durationS ?? null)}
        />
      ) : null}
    </>
  )
}
