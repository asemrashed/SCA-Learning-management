"use client"

import Image from "next/image"
import { Quote } from "lucide-react"

interface ReviewCardProps {
  name: string
  image?: string
  initials?: string
  review: string
  course?: string
  batch?: string
}

export function ReviewCard({
  name,
  image,
  initials,
  review,
  course,
  batch,
}: ReviewCardProps) {
  return (
    <div className="flex h-full flex-col justify-between rounded-2xl border border-border bg-white p-4 md:p-6">
      <p className="mb-4 md:mb-6 text-xs md:text-sm leading-relaxed text-muted-foreground animate-none">
        {review}
      </p>

      <div className="flex items-end justify-between gap-2 md:gap-4">
        <div className="flex items-center gap-2 md:gap-3 min-w-0">
          {image ? (
            <div className="relative h-8 w-8 md:h-10 md:w-10 shrink-0 overflow-hidden rounded-full">
              <Image src={image} alt={name} fill className="object-cover" />
            </div>
          ) : (
            <div className="flex h-8 w-8 md:h-10 md:w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs md:text-sm font-semibold text-primary">
              {initials}
            </div>
          )}
          <div className="min-w-0">
            <h4 className="truncate text-xs md:text-sm font-semibold text-foreground">{name}</h4>
            {(course || batch) && (
              <p className="truncate text-[10px] md:text-xs text-muted-foreground">
                {course}
                {batch && ` • ${batch}`}
              </p>
            )}
          </div>
        </div>
        <Quote className="h-6 w-6 md:h-8 md:w-8 shrink-0 fill-primary/20 text-primary" />
      </div>
    </div>
  )
}
