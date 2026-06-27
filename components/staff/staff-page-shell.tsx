"use client"

import { usePathname } from "next/navigation"
import { BackButton } from "@/components/back-button"
import { cn } from "@/lib/utils"
import { getStaffBackHref, getStaffBackLabel } from "@/lib/staff-routes"

interface StaffPageShellProps {
  title: string
  children: React.ReactNode
  className?: string
  backHref?: string | null
}

export function StaffPageShell({
  title,
  children,
  className,
  backHref,
}: StaffPageShellProps) {
  const pathname = usePathname()
  const resolvedBack = backHref === undefined ? getStaffBackHref(pathname) : backHref
  const backLabel = resolvedBack ? getStaffBackLabel(pathname) : null

  return (
    <div className={cn("mx-auto w-full max-w-6xl p-4 md:p-8", className)}>
      <div className="mb-6 rounded-2xl border border-border bg-card p-5 shadow-sm md:p-8">
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <h2 className="text-xl font-bold text-foreground md:text-2xl">{title}</h2>
        </div>

        {resolvedBack && backLabel ? (
          <div className="mb-6">
            <BackButton href={resolvedBack} label={`Back to ${backLabel}`} />
          </div>
        ) : null}

        {children}
      </div>
    </div>
  )
}
