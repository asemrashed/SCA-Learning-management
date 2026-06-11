"use client"

import Image from "next/image"
import Link from "next/link"
import { Clock, ArrowRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { formatBdtMinor } from "@/lib/format-currency"
import type { BatchListItem } from "@/features/batch/types"
import { BATCH_STATUS_LABEL, daysUntil, formatBatchDate } from "@/features/batch/utils"

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?w=400&h=250&fit=crop"

interface BatchCardProps {
  batch: BatchListItem
}

export function BatchCard({ batch }: BatchCardProps) {
  const daysLeft = daysUntil(batch.registrationDeadline)
  const isLive = batch.status === "ACTIVE"

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      viewport={{ once: true }}
      whileHover={{ y: -5 }}
      className="group overflow-hidden rounded-[20px] bg-card shadow-sm transition-all hover:shadow-lg"
    >
      <div className="relative aspect-video overflow-hidden">
        <Image
          src={batch.thumbnail || FALLBACK_IMAGE}
          alt={batch.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {isLive && (
          <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-destructive px-3 py-1">
            <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
            <span className="text-xs font-medium text-white">LIVE</span>
          </div>
        )}
        <Badge className="absolute right-3 top-3 bg-primary/90 text-primary-foreground">
          {BATCH_STATUS_LABEL[batch.status] ?? batch.status}
        </Badge>
      </div>

      <div className="p-3 md:p-4">
        <div className="mb-2.5 flex flex-wrap gap-1.5 md:gap-2">
          {batch.capacity != null && (
            <span className="rounded-lg bg-accent/10 px-1.5 py-0.5 text-[9px] font-medium text-accent md:px-2.5 md:py-1 md:text-xs">
              {batch.capacity} seats
            </span>
          )}
          {daysLeft != null && (
            <span className="rounded-lg bg-primary/10 px-1.5 py-0.5 text-[9px] font-medium text-primary md:px-2.5 md:py-1 md:text-xs">
              {daysLeft > 0 ? `${daysLeft} days left` : "Closing soon"}
            </span>
          )}
        </div>

        <h3 className="mb-2 line-clamp-2 min-h-[32px] text-xs font-semibold text-foreground md:min-h-[48px] md:text-base">
          {batch.title}
        </h3>

        <div className="mb-3 flex items-center gap-2 text-[10px] text-muted-foreground md:mb-4 md:text-sm">
          <Clock className="h-3 w-3 md:h-4 md:w-4" />
          <span>Starts {formatBatchDate(batch.startDate)}</span>
        </div>

        <div className="mb-3 flex items-center gap-1.5 md:mb-4 md:gap-2">
          <span className="text-sm font-bold text-primary md:text-lg">
            {batch.priceMinor === 0 ? "Free" : formatBdtMinor(batch.priceMinor)}
          </span>
        </div>

        <Link href={`/batches/${batch.slug}`}>
          <Button
            variant="outline"
            className="h-8 w-full rounded-xl border-border bg-muted/50 px-2 text-xs transition-all hover:border-primary hover:bg-primary hover:text-primary-foreground md:h-10 md:px-4 md:text-sm"
          >
            <span className="hidden sm:inline">View Details</span>
            <span className="sm:hidden">Details</span>
            <ArrowRight className="ml-1 h-3.5 w-3.5 md:ml-2 md:h-4 md:w-4" />
          </Button>
        </Link>
      </div>
    </motion.div>
  )
}
