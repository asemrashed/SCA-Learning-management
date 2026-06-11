"use client"

import { useState } from "react"
import { Search, Filter } from "lucide-react"
import { motion } from "framer-motion"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useListBatchesQuery } from "@/features/batch/api"
import { BatchCard } from "@/features/batch/components/BatchCard"
import type { BatchStatus } from "@/features/batch/types"

export function BatchCatalog() {
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState<BatchStatus | "all">("all")
  const { data, isLoading, isError } = useListBatchesQuery({
    page: 1,
    pageSize: 20,
    search: search.trim() || undefined,
    status: status === "all" ? undefined : status,
    sort: "startDate:asc",
  })

  const batches = data?.data ?? []
  const meta = data?.meta

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="py-8">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <h1 className="mb-2 text-3xl font-bold text-foreground md:text-4xl">
              Live Batches
            </h1>
            <p className="text-muted-foreground">
              Cohort-based programs with structured subjects, modules, and lessons
            </p>
          </motion.div>

          <div className="mb-8 flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search batches..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="rounded-xl pl-9"
              />
            </div>
            <div className="flex gap-2">
              <Select
                value={status}
                onValueChange={(value) => setStatus(value as BatchStatus | "all")}
              >
                <SelectTrigger className="w-40 rounded-xl">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="UPCOMING">Upcoming</SelectItem>
                  <SelectItem value="ACTIVE">Live now</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" className="rounded-xl">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {isLoading && (
            <p className="py-20 text-center text-muted-foreground">Loading batches...</p>
          )}

          {isError && (
            <p className="py-20 text-center text-destructive">
              Could not load batches. Check that the API is running.
            </p>
          )}

          {!isLoading && !isError && (
            <>
              <div className="mb-6 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Showing{" "}
                  <span className="font-medium text-foreground">{batches.length}</span>
                  {meta ? ` of ${meta.total}` : ""} batches
                </p>
              </div>

              {batches.length > 0 ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {batches.map((batch, index) => (
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
                  <p className="text-muted-foreground">No batches found matching your criteria.</p>
                </div>
              )}

            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
