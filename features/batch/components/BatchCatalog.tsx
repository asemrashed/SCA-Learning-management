"use client"

import { useEffect, useMemo, useState } from "react"
import { Search, Calendar, Grid3X3, Layers, Radio, Zap } from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CategoryNav } from "@/components/home/category-nav"
import { useListBatchesQuery } from "@/features/batch/api"
import { BatchCard } from "@/features/batch/components/BatchCard"
import type { BatchStatus } from "@/features/batch/types"
import { BATCH_STATUS_LABEL } from "@/features/batch/utils"
import {
  LIVE_COURSES,
  liveCourseCount,
} from "@/lib/product-vocabulary"

const STATUS_ICONS: Record<string, typeof Radio> = {
  UPCOMING: Calendar,
  ACTIVE: Zap,
  COMPLETED: Layers,
}

const PAGE_SIZE = 12

export function BatchCatalog() {
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [activeCategory, setActiveCategory] = useState("all")
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 300)
    return () => clearTimeout(timer)
  }, [search])

  useEffect(() => {
    setVisibleCount(PAGE_SIZE)
  }, [debouncedSearch, activeCategory])

  const { data, isLoading, isError, isFetching } = useListBatchesQuery({
    page: 1,
    pageSize: 100,
    search: debouncedSearch || undefined,
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

  const filteredBatches = useMemo(() => {
    if (activeCategory === "all") return batches
    const status = activeCategory.toUpperCase() as BatchStatus
    return batches.filter((b) => b.status === status)
  }, [batches, activeCategory])

  const visibleBatches = filteredBatches.slice(0, visibleCount)
  const hasMore = visibleCount < filteredBatches.length

  return (
    <main className="py-8">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10 text-center"
        >
          <div className="mb-4 flex items-center justify-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Radio className="h-5 w-5 text-primary" />
            </div>
          </div>
          <h1 className="mb-2 text-3xl font-bold text-foreground md:text-4xl">
            Our {LIVE_COURSES}
          </h1>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Join structured programs with live sessions, expert instructors, and a full curriculum
          </p>
        </motion.div>

        <div className="relative mb-8 flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search live courses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-xl pl-9"
          />
        </div>

        {categories.length > 0 ? (
          <CategoryNav
            items={categories}
            activeId={activeCategory}
            onChange={setActiveCategory}
            className="mb-10"
          />
        ) : null}

        {isLoading && (
          <p className="py-20 text-center text-muted-foreground">Loading {LIVE_COURSES.toLowerCase()}…</p>
        )}

        {isError && (
          <p className="py-20 text-center text-destructive">
            Could not load {LIVE_COURSES.toLowerCase()}. Check that the API is running.
          </p>
        )}

        {!isLoading && !isError && (
          <>
            <p className="mb-6 text-sm text-muted-foreground">
              Showing {visibleBatches.length} of {filteredBatches.length} {LIVE_COURSES.toLowerCase()}
            </p>

            {visibleBatches.length > 0 ? (
              <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">
                {visibleBatches.map((batch, index) => (
                  <motion.div
                    key={batch.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                  >
                    <BatchCard batch={batch} />
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="py-20 text-center">
                <p className="text-muted-foreground">No {LIVE_COURSES.toLowerCase()} found matching your criteria.</p>
              </div>
            )}

            {hasMore ? (
              <div className="mt-12 text-center">
                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-xl"
                  disabled={isFetching}
                  onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
                >
                  {isFetching ? "Loading…" : `Load more ${LIVE_COURSES.toLowerCase()}`}
                </Button>
              </div>
            ) : null}
          </>
        )}
      </div>
    </main>
  )
}
