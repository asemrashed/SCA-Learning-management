"use client"

import { useRef } from "react"
import { ChevronLeft, ChevronRight, LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface CategoryNavItem {
  id: string
  label: string
  icon: LucideIcon
  subtitle?: string
}

interface CategoryNavProps {
  items: CategoryNavItem[]
  activeId: string
  onChange: (id: string) => void
  className?: string
  variant?: "default" | "dark" | "on-dark"
}

function getNavItemStyles(
  variant: "default" | "dark" | "on-dark",
  isActive: boolean
) {
  const isOnDark = variant === "on-dark"
  const isDark = variant === "dark"

  if (isOnDark) {
    return {
      button: isActive
        ? "bg-white text-foreground shadow-md"
        : "border border-white/25 bg-white/5 text-white hover:bg-white hover:text-foreground hover:shadow-md hover:border-white",
      iconWrap: isActive
        ? "bg-primary/30"
        : "bg-white/10 group-hover:bg-primary/30",
      icon: isActive
        ? "text-secondary"
        : "text-white group-hover:text-secondary",
      subtitle: isActive
        ? "text-muted-foreground"
        : "text-white/60 group-hover:text-muted-foreground",
    }
  }

  if (isDark) {
    return {
      button: isActive
        ? "bg-secondary text-secondary-foreground shadow-md"
        : "border border-border bg-white text-foreground hover:bg-secondary hover:text-secondary-foreground hover:border-secondary hover:shadow-md",
      iconWrap: isActive
        ? "bg-white/15"
        : "bg-muted group-hover:bg-white/15",
      icon: isActive
        ? "text-white"
        : "text-secondary group-hover:text-white",
      subtitle: isActive
        ? "text-secondary-foreground/70"
        : "text-muted-foreground group-hover:text-secondary-foreground/70",
    }
  }

  return {
    button: isActive
      ? "bg-secondary text-secondary-foreground shadow-md"
      : "border border-border bg-white text-foreground hover:bg-secondary hover:text-secondary-foreground hover:border-secondary hover:shadow-md",
    iconWrap: isActive
      ? "bg-white/15"
      : "bg-muted group-hover:bg-white/15",
    icon: isActive
      ? "text-white"
      : "text-secondary group-hover:text-white",
    subtitle: isActive
      ? "text-secondary-foreground/70"
      : "text-muted-foreground group-hover:text-secondary-foreground/70",
  }
}

export function CategoryNav({
  items,
  activeId,
  onChange,
  className,
  variant = "default",
}: CategoryNavProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const isOnDark = variant === "on-dark"

  const scrollLeft = () => {
    scrollRef.current?.scrollBy({ left: -280, behavior: "smooth" })
  }

  const scrollRight = () => {
    scrollRef.current?.scrollBy({ left: 280, behavior: "smooth" })
  }

  return (
    <div className={cn("relative flex items-center gap-2 md:gap-3", className)}>
      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={scrollLeft}
        className={cn(
          "flex h-9 w-9 md:h-10 md:w-10 shrink-0 items-center justify-center rounded-full shadow-sm transition-colors",
          isOnDark
            ? "border-white/25 bg-white/10 text-white hover:bg-white hover:text-foreground"
            : "border-border bg-white hover:bg-secondary hover:text-secondary-foreground"
        )}
        aria-label="Scroll categories left"
      >
        <ChevronLeft className="h-4 w-4 md:h-5 md:w-5" />
      </Button>

      <div
        ref={scrollRef}
        className="flex flex-1 gap-3 overflow-x-auto pb-1 scrollbar-hide"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {items.map((item) => {
          const isActive = activeId === item.id
          const styles = getNavItemStyles(variant, isActive)

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange(item.id)}
              className={cn(
                "group flex min-w-[200px] shrink-0 items-center gap-3 rounded-2xl px-4 py-3 text-left transition-all sm:min-w-[240px]",
                styles.button
              )}
            >
              <div
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors",
                  styles.iconWrap
                )}
              >
                <item.icon
                  className={cn("h-5 w-5 transition-colors", styles.icon)}
                />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{item.label}</p>
                {item.subtitle && (
                  <p className={cn("truncate text-xs transition-colors", styles.subtitle)}>
                    {item.subtitle}
                  </p>
                )}
              </div>
            </button>
          )
        })}
      </div>

      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={scrollRight}
        className={cn(
          "flex h-9 w-9 md:h-10 md:w-10 shrink-0 items-center justify-center rounded-full shadow-sm transition-colors",
          isOnDark
            ? "border-white/25 bg-white/10 text-white hover:bg-white hover:text-foreground"
            : "border-border bg-white hover:bg-secondary hover:text-secondary-foreground"
        )}
        aria-label="Scroll categories right"
      >
        <ChevronRight className="h-4 w-4 md:h-5 md:w-5" />
      </Button>
    </div>
  )
}
