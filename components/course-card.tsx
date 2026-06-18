"use client"

import Image from "next/image"
import Link from "next/link"
import { Clock, Layers, Users, ArrowRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { batchCount, studentCount as formatStudentCount } from "@/lib/product-vocabulary"
import { motion } from "framer-motion"
import { formatBdt } from "@/lib/format-currency"

type CourseCardVariant = "light" | "dark"

interface CourseCardProps {
  id: string
  title: string
  image: string
  batch?: string
  batchCount?: number
  seatsLeft?: number
  daysLeft?: number
  price?: number
  originalPrice?: number
  rating?: number
  students?: number
  duration?: string
  category?: string
  isLive?: boolean
  isFree?: boolean
  hidePrice?: boolean
  variant?: CourseCardVariant
  textWhite?: boolean
}

export function CourseCard({
  id,
  title,
  image,
  batch,
  batchCount: batchTotal,
  seatsLeft,
  daysLeft,
  price,
  originalPrice,
  rating,
  students,
  duration,
  category,
  isLive = false,
  isFree = false,
  hidePrice = false,
  variant = "light",
  textWhite = false,
}: CourseCardProps) {
  const isDark = variant === "dark"
  const useWhiteText = isDark && textWhite

  const titleClass = useWhiteText
    ? "text-white"
    : isDark
      ? "text-primary"
      : "text-foreground"
  const metaClass = useWhiteText
    ? "text-white/80"
    : isDark
      ? "text-primary/80"
      : "text-muted-foreground"
  const chipClass = useWhiteText
    ? "bg-white/15 text-white"
    : isDark
      ? "bg-primary/10 text-primary"
      : "bg-muted text-muted-foreground"
  const priceClass = useWhiteText ? "text-white" : "text-primary"
  const strikeClass = useWhiteText ? "text-white/60" : isDark ? "text-primary/60" : "text-muted-foreground"

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      viewport={{ once: true }}
      whileHover={{ y: -5 }}
      className={cn(
        "group overflow-hidden rounded-[20px] shadow-sm transition-all hover:shadow-lg",
        isDark ? "bg-secondary" : "bg-card",
      )}
    >
      <div className="relative aspect-video overflow-hidden">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {isLive && !isDark && (
          <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-destructive px-3 py-1">
            <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
            <span className="text-xs font-medium text-white">LIVE</span>
          </div>
        )}
        {isDark && category ? (
          <Badge
            className={cn(
              "absolute left-3 top-3 max-w-[calc(100%-6rem)] truncate hover:opacity-90",
              useWhiteText ? "bg-primary text-secondary" : "bg-secondary text-primary hover:bg-secondary",
            )}
          >
            {category}
          </Badge>
        ) : null}
        {isFree && !hidePrice && (
          <Badge
            className={cn(
              "absolute right-3 top-3",
              isDark ? "bg-primary text-secondary hover:bg-primary" : "bg-accent text-accent-foreground",
            )}
          >
            Free
          </Badge>
        )}
      </div>

      <div className="p-3 md:p-4">
        {(batch || batchTotal != null || seatsLeft || daysLeft) && (
          <div className="mb-2.5 flex flex-wrap gap-1.5 md:gap-2">
            {batch && (
              <span className={cn("rounded-lg px-1.5 py-0.5 text-[9px] font-medium md:px-2.5 md:py-1 md:text-xs", chipClass)}>
                {batch}
              </span>
            )}
            {batchTotal != null && (
              <span className={cn("inline-flex items-center gap-1 rounded-lg px-1.5 py-0.5 text-[9px] font-medium md:px-2.5 md:py-1 md:text-xs", chipClass)}>
                <Layers className="h-3 w-3" />
                {batchCount(batchTotal)}
              </span>
            )}
            {seatsLeft && (
              <span className={cn("rounded-lg px-1.5 py-0.5 text-[9px] font-medium md:px-2.5 md:py-1 md:text-xs", chipClass)}>
                <span className="hidden sm:inline">{seatsLeft} seats left</span>
                <span className="inline sm:hidden">{seatsLeft} left</span>
              </span>
            )}
            {daysLeft && (
              <span className={cn("rounded-lg px-1.5 py-0.5 text-[9px] font-medium md:px-2.5 md:py-1 md:text-xs", chipClass)}>
                <span className="hidden sm:inline">{daysLeft} days left</span>
                <span className="inline sm:hidden">{daysLeft} days</span>
              </span>
            )}
          </div>
        )}

        {category && !isDark && (
          <p className="mb-1 text-[10px] font-medium text-muted-foreground md:text-xs">{category}</p>
        )}

        <h3
          className={cn(
            "mb-2 line-clamp-2 min-h-[32px] text-xs font-semibold md:min-h-[48px] md:text-base",
            titleClass,
          )}
        >
          {title}
        </h3>

        {(rating || students != null || duration) && (
          <div className={cn("mb-3 flex flex-wrap items-center gap-2 text-[10px] md:mb-4 md:gap-4 md:text-sm", metaClass)}>
            {rating && (
              <div className="flex items-center gap-0.5 md:gap-1">
                <svg className="h-3 w-3 fill-amber-400 text-amber-400 md:h-4 md:w-4" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span>{rating}</span>
              </div>
            )}
            {students != null && (
              <div className="flex items-center gap-0.5 md:gap-1">
                <Users className="h-3 w-3 md:h-4 md:w-4" />
                <span>{formatStudentCount(students)}</span>
              </div>
            )}
            {duration && (
              <div className="flex items-center gap-0.5 md:gap-1">
                <Clock className="h-3 w-3 md:h-4 md:w-4" />
                <span>{duration}</span>
              </div>
            )}
          </div>
        )}

        {!hidePrice && price !== undefined && (
          <div className="mb-3 flex items-center gap-1.5 md:mb-4 md:gap-2">
            <span className={cn("text-sm font-bold md:text-lg", priceClass)}>
              {isFree ? "Free" : formatBdt(price)}
            </span>
            {originalPrice && originalPrice > price && (
              <span className={cn("text-[10px] line-through md:text-sm", strikeClass)}>
                {formatBdt(originalPrice)}
              </span>
            )}
          </div>
        )}

        <Link href={`/courses/${id}`}>
          <Button
            variant="outline"
            className={cn(
              "h-8 w-full rounded-xl px-2 text-xs transition-all md:h-10 md:px-4 md:text-sm",
              isDark
                ? useWhiteText
                  ? "border-white/30 bg-white text-secondary hover:border-white hover:bg-primary hover:text-secondary"
                  : "border-primary/30 bg-white text-secondary hover:border-primary hover:bg-primary hover:text-secondary"
                : "border-border bg-muted/50 hover:border-primary hover:bg-primary hover:text-primary-foreground",
            )}
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
