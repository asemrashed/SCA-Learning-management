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
    <div className="flex h-full flex-col justify-between rounded-2xl border border-border bg-white p-6">
      <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
        {review}
      </p>

      <div className="flex items-end justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          {image ? (
            <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full">
              <Image src={image} alt={name} fill className="object-cover" />
            </div>
          ) : (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
              {initials}
            </div>
          )}
          <div className="min-w-0">
            <h4 className="truncate text-sm font-semibold text-foreground">{name}</h4>
            {(course || batch) && (
              <p className="truncate text-xs text-muted-foreground">
                {course}
                {batch && ` • ${batch}`}
              </p>
            )}
          </div>
        </div>
        <Quote className="h-8 w-8 shrink-0 fill-primary/20 text-primary" />
      </div>
    </div>
  )
}
