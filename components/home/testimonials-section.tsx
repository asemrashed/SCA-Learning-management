"use client"

import { ReviewCard } from "@/components/review-card"
import type { ReviewPublicItem } from "@/types/api"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

function initialsFromName(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
}

function toCardProps(review: ReviewPublicItem) {
  return {
    name: review.studentName,
    review: review.text,
    course: review.courseTitle,
    batch: review.batchTitle ?? undefined,
    image: review.studentAvatarUrl ?? undefined,
    initials: review.studentAvatarUrl ? undefined : initialsFromName(review.studentName),
  }
}

interface TestimonialsSectionProps {
  reviews: ReviewPublicItem[]
}

export function TestimonialsSection({ reviews }: TestimonialsSectionProps) {
  if (reviews.length === 0) return null

  const cards = reviews.map(toCardProps)

  return (
    <section className="bg-background py-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="mb-12 text-center"
        >
          <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">
            What Our Students Say
          </h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Hear from our graduates who have successfully transformed their careers
          </p>
        </motion.div>

        <div className="hidden lg:grid lg:grid-cols-4 lg:gap-6">
          <div className="flex flex-col gap-6">
            {cards.slice(0, 2).map((review, index) => (
              <motion.div
                key={`${review.name}-${index}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <ReviewCard {...review} />
              </motion.div>
            ))}
          </div>

          <div className="col-span-2 flex flex-col gap-6">
            {cards.slice(2, 3).map((review, index) => (
              <motion.div
                key={`${review.name}-center-${index}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                viewport={{ once: true }}
              >
                <ReviewCard {...review} />
              </motion.div>
            ))}
            <div className="grid grid-cols-2 gap-6">
              {cards.slice(3, 5).map((review, index) => (
                <motion.div
                  key={`${review.name}-mid-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 + index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <ReviewCard {...review} />
                </motion.div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-6">
            {cards.slice(5, 8).map((review, index) => (
              <motion.div
                key={`${review.name}-right-${index}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 + index * 0.1 }}
                viewport={{ once: true }}
              >
                <ReviewCard {...review} />
              </motion.div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 lg:hidden">
          {cards.map((review, index) => {
            const isLong = review.review.length > 220
            return (
              <motion.div
                key={`${review.name}-mobile-${index}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: (index % 2) * 0.1 }}
                viewport={{ once: true }}
                className={cn(isLong ? "col-span-2" : "col-span-1")}
              >
                <ReviewCard {...review} />
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
