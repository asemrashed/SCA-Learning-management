"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface DashboardLinkCardProps {
  href: string
  title: string
  count?: number
  icon: LucideIcon
  className?: string
  iconClassName?: string
  titleClassName?: string
  delay?: number
}

export function DashboardLinkCard({
  href,
  title,
  count,
  icon: Icon,
  className,
  iconClassName,
  titleClassName,
  delay = 0,
}: DashboardLinkCardProps) {
  const label = count !== undefined ? `${title} (${count})` : title

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
    >
      <Link
        href={href}
        className={cn(
          "group flex flex-col items-center justify-center rounded-2xl p-8 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg",
          className,
        )}
      >
        <div
          className={cn(
            "mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white/80 shadow-inner transition-transform duration-300 group-hover:scale-110",
            iconClassName,
          )}
        >
          <Icon className="h-9 w-9" />
        </div>
        <span className={cn("text-lg font-bold", titleClassName)}>{label}</span>
      </Link>
    </motion.div>
  )
}
