"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight, type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface SectionLinkCardProps {
  href: string
  title: string
  icon: LucideIcon
  className?: string
  iconClassName?: string
  delay?: number
}

export function SectionLinkCard({
  href,
  title,
  icon: Icon,
  className,
  iconClassName,
  delay = 0,
}: SectionLinkCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
    >
      <Link
        href={href}
        className={cn(
          "group flex flex-col items-center justify-center rounded-2xl border border-border bg-card p-6 text-center shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md",
          className,
        )}
      >
        <div
          className={cn(
            "mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-muted transition-transform duration-300 group-hover:scale-105",
            iconClassName,
          )}
        >
          <Icon className="h-7 w-7 text-primary" />
        </div>
        <span className="mb-2 font-semibold text-foreground">{title}</span>
        <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
      </Link>
    </motion.div>
  )
}
