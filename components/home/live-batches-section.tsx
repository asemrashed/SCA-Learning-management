"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { ArrowRight, Calendar, Grid3X3, Layers, Radio, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CategoryNav } from "@/components/home/category-nav"
import { BatchCard } from "@/features/batch/components/BatchCard"
import { useListBatchesQuery } from "@/features/batch/api"
import type { BatchStatus } from "@/features/batch/types"
import { BATCH_STATUS_LABEL } from "@/features/batch/utils"
import {
  BROWSE_LIVE_COURSES,
  LIVE_COURSE_CATALOG_HREF,
  LIVE_COURSES,
  liveCourseCount,
} from "@/lib/product-vocabulary"
import { motion } from "framer-motion"

const MAX_CARDS = 4

const STATUS_ICONS: Record<string, typeof Radio> = {
  UPCOMING: Calendar,
  ACTIVE: Zap,
  COMPLETED: Layers,
}

export function LiveBatchesSection() {
  const { data, isLoading } = useListBatchesQuery({
    page: 1,
    pageSize: 12,
    sort: "startDate:asc",
  })

  const batches = data?.data ?? []

  const categories = useMemo(() => {
    const counts = new Map<BatchStatus, number>()
    for (const batch of batches) {
      counts.set(batch.status, (counts.get(batch.status) ?? 0) + 1)
    }

    const statusItems = (["UPCOMING", "ACTIVE", "COMPLETED"] as BatchStatus[])
      .filter((status) => (counts.get(status) ?? 0) > 0)
      .map((status) => ({
        id: status.toLowerCase(),
        label: BATCH_STATUS_LABEL[status] ?? status,
        icon: STATUS_ICONS[status] ?? Layers,
        subtitle: liveCourseCount(counts.get(status) ?? 0),
      }))

    return [
      {
        id: "all",
        label: "All",
        icon: Grid3X3,
        subtitle: liveCourseCount(batches.length),
      },
      ...statusItems,
    ]
  }, [batches])

  const [activeCategory, setActiveCategory] = useState("all")

  const filteredBatches = useMemo(() => {
    if (activeCategory === "all") return batches
    const status = activeCategory.toUpperCase() as BatchStatus
    return batches.filter((b) => b.status === status)
  }, [batches, activeCategory])

  const displayBatches = filteredBatches.slice(0, MAX_CARDS)

  return (
    <section className="bg-foreground py-20 text-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="mb-10 text-center"
        >
          <div className="mb-4 flex items-center justify-center gap-2">
            <Badge className="rounded-full bg-destructive px-4 py-1 text-white">
              <span className="mr-2 inline-block h-2 w-2 animate-pulse rounded-full bg-white" />
              LIVE
            </Badge>
          </div>
          <h2 className="mb-2 text-3xl font-bold text-white md:text-4xl">
            Our {LIVE_COURSES}
          </h2>
          <p className="mx-auto max-w-2xl text-white/70">
            Join structured programs with live sessions, expert instructors, and a full curriculum
          </p>
        </motion.div>

        {categories.length > 0 ? (
          <CategoryNav
            items={categories}
            activeId={activeCategory}
            onChange={setActiveCategory}
            variant="on-dark"
            className="mb-10"
          />
        ) : null}

        {isLoading ? (
          <p className="py-12 text-center text-white/70">Loading {LIVE_COURSES.toLowerCase()}…</p>
        ) : displayBatches.length === 0 ? (
          <p className="py-12 text-center text-white/70">{LIVE_COURSES} coming soon.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">
            {displayBatches.map((batch, index) => (
              <motion.div
                key={batch.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
                viewport={{ once: true }}
              >
                <BatchCard batch={batch} />
              </motion.div>
            ))}
          </div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <Button
            variant="outline"
            size="lg"
            className="rounded-xl border-white/30 bg-transparent text-white hover:bg-white hover:text-foreground"
            asChild
          >
            <Link href={LIVE_COURSE_CATALOG_HREF}>
              {BROWSE_LIVE_COURSES}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  )
}
