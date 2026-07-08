"use client"

import { cn } from "@/lib/utils"

export interface FilterPillOption<T extends string = string> {
  value: T
  label: string
}

interface FilterPillsProps<T extends string = string> {
  options: FilterPillOption<T>[]
  value: T
  onChange: (value: T) => void
  className?: string
}

export function FilterPills<T extends string = string>({
  options,
  value,
  onChange,
  className,
}: FilterPillsProps<T>) {
  if (options.length === 0) return null

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {options.map((option) => {
        const isActive = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
              isActive
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background text-muted-foreground hover:border-primary/40",
            )}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
