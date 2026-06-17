"use client"

import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import type { CategoryListItem } from "@/types/api"
import { categoryColSpan } from "@/features/category/utils"

interface CategoryCardProps {
  category: CategoryListItem
  index: number
  animate?: boolean
}

export function CategoryCard({ category, index, animate = true }: CategoryCardProps) {
  const content = (
    <Link
      href={`/courses?category=${category.slug}`}
      className="group relative block h-full overflow-hidden rounded-2xl bg-white p-4 sm:p-6 shadow-[0_10px_30px_rgba(0,0,0,0.05)] transition-all hover:shadow-[0_15px_40px_rgba(0,0,0,0.08)]"
    >
      <span className="pointer-events-none absolute -bottom-2 -right-1 text-[5rem] font-bold leading-none text-secondary/10 select-none">
        {String(index + 1).padStart(2, "0")}
      </span>

      <div className="relative z-10 flex h-full flex-col items-center gap-3 text-center sm:flex-row sm:items-center sm:gap-4 sm:text-left">
        {category.image ? (
          <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/20 p-1.5 sm:h-20 sm:w-20 md:h-24 md:w-24 sm:p-2">
            <Image
              src={category.image}
              alt={category.title}
              width={80}
              height={80}
              className="h-full w-full rounded-full object-cover"
            />
          </div>
        ) : null}
        <div className="min-w-0 flex-1">
          <h3 className="mb-1 text-sm font-semibold text-foreground transition-colors group-hover:text-secondary sm:mb-2 sm:text-base md:text-lg">
            {category.title}
          </h3>
          {category.shortIntro ? (
            <p className="mb-2 line-clamp-2 text-xs text-muted-foreground sm:mb-4 sm:text-sm">
              {category.shortIntro}
            </p>
          ) : null}
          <span className="inline-flex items-center rounded-full bg-primary/40 px-2.5 py-0.5 text-[10px] font-medium text-secondary sm:px-3 sm:py-1 sm:text-xs">
            • {category.courseCount}+ Courses
          </span>
        </div>
      </div>
    </Link>
  )

  if (!animate) {
    return <div className={`w-full ${categoryColSpan(index)}`}>{content}</div>
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      viewport={{ once: true }}
      className={`w-full ${categoryColSpan(index)}`}
    >
      {content}
    </motion.div>
  )
}
