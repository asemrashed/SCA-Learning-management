"use client"

import Image from "next/image"
import Link from "next/link"
import { Clock, Users, ArrowRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { formatBdt } from "@/lib/format-currency"

interface CourseCardProps {
  id: string
  title: string
  image: string
  batch?: string
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
}

export function CourseCard({
  id,
  title,
  image,
  batch,
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
}: CourseCardProps) {
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
          src={image}
          alt={title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {isLive && (
          <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-destructive px-3 py-1">
            <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
            <span className="text-xs font-medium text-white">LIVE</span>
          </div>
        )}
        {isFree && (
          <Badge className="absolute right-3 top-3 bg-accent text-accent-foreground">
            Free
          </Badge>
        )}
      </div>

      <div className="p-3 md:p-4">
        {/* Meta info */}
        {(batch || seatsLeft || daysLeft) && (
          <div className="mb-2.5 flex flex-wrap gap-1.5 md:gap-2">
            {batch && (
              <span className="rounded-lg bg-muted px-1.5 py-0.5 md:px-2.5 md:py-1 text-[9px] md:text-xs font-medium text-muted-foreground">
                {batch}
              </span>
            )}
            {seatsLeft && (
              <span className="rounded-lg bg-accent/10 px-1.5 py-0.5 md:px-2.5 md:py-1 text-[9px] md:text-xs font-medium text-accent">
                <span className="sm:inline hidden">{seatsLeft} seats left</span>
                <span className="inline sm:hidden">{seatsLeft} left</span>
              </span>
            )}
            {daysLeft && (
              <span className="rounded-lg bg-primary/10 px-1.5 py-0.5 md:px-2.5 md:py-1 text-[9px] md:text-xs font-medium text-primary">
                <span className="sm:inline hidden">{daysLeft} days left</span>
                <span className="inline sm:hidden">{daysLeft} days</span>
              </span>
            )}
          </div>
        )}

        {/* Category */}
        {category && (
          <p className="mb-1 text-[10px] md:text-xs font-medium text-muted-foreground">{category}</p>
        )}

        {/* Title */}
        <h3 className="mb-2 line-clamp-2 min-h-[32px] md:min-h-[48px] text-xs md:text-base font-semibold text-foreground">
          {title}
        </h3>

        {/* Stats */}
        {(rating || students || duration) && (
          <div className="mb-3 md:mb-4 flex flex-wrap items-center gap-2 md:gap-4 text-[10px] md:text-sm text-muted-foreground">
            {rating && (
              <div className="flex items-center gap-0.5 md:gap-1">
                <svg className="h-3 w-3 md:h-4 md:w-4 fill-amber-400 text-amber-400" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span>{rating}</span>
              </div>
            )}
            {students && (
              <div className="flex items-center gap-0.5 md:gap-1">
                <Users className="h-3 w-3 md:h-4 md:w-4" />
                <span>{students.toLocaleString()}</span>
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

        {/* Price */}
        {price !== undefined && (
          <div className="mb-3 md:mb-4 flex items-center gap-1.5 md:gap-2">
            <span className="text-sm md:text-lg font-bold text-primary">
              {isFree ? "Free" : formatBdt(price)}
            </span>
            {originalPrice && originalPrice > price && (
              <span className="text-[10px] md:text-sm text-muted-foreground line-through">
                {formatBdt(originalPrice)}
              </span>
            )}
          </div>
        )}

        {/* CTA */}
        <Link href={`/courses/${id}`}>
          <Button
            variant="outline"
            className="w-full rounded-xl border-border bg-muted/50 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all text-xs md:text-sm h-8 md:h-10 px-2 md:px-4"
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
